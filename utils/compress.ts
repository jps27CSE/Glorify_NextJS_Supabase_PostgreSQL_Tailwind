export interface CompressProgress {
  stage: "idle" | "reading" | "compressing" | "done" | "error";
  percent: number;
  message: string;
}

type ProgressCallback = (progress: CompressProgress) => void;

const MAX_IMAGE_SIZE = 75 * 1024;
const MAX_SONG_SIZE = 7 * 1024 * 1024;

const STORAGE_KEY = "glorify_compress_stats";

interface CompressStats {
  totalSaved: number;
  songsCompressed: number;
  imagesCompressed: number;
}

const getStats = (): CompressStats => {
  if (typeof window === "undefined")
    return { totalSaved: 0, songsCompressed: 0, imagesCompressed: 0 };
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw
    ? JSON.parse(raw)
    : { totalSaved: 0, songsCompressed: 0, imagesCompressed: 0 };
};

const saveStats = (stats: CompressStats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

export const getCompressStats = (): CompressStats => getStats();

function emit(
  cb: ProgressCallback | undefined,
  data: CompressProgress
) {
  cb?.(data);
}

export async function compressImage(
  file: File,
  onProgress?: ProgressCallback
): Promise<File> {
  emit(onProgress, {
    stage: "reading",
    percent: 0,
    message: "Reading image...",
  });

  const originalSize = file.size;

  if (originalSize <= MAX_IMAGE_SIZE) {
    emit(onProgress, {
      stage: "done",
      percent: 100,
      message: "Image already within limits",
    });
    return file;
  }

  const img = await createImageBitmap(file);

  let width = img.width;
  let height = img.height;

  emit(onProgress, {
    stage: "compressing",
    percent: 10,
    message: "Compressing image...",
  });

  const canvas = document.createElement("canvas");
  let quality = 0.8;
  let compressedBlob: Blob | null = null;

  for (let attempt = 0; attempt < 10; attempt++) {
    if (width > 1200 || height > 1200) {
      const ratio = Math.min(1200 / width, 1200 / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, width, height);

    compressedBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(
        (b) => resolve(b),
        "image/jpeg",
        quality
      )
    );

    if (!compressedBlob) break;

    const percent = Math.min(
      90,
      10 + Math.round(((1 - quality) / 0.8) * 80)
    );
    emit(onProgress, {
      stage: "compressing",
      percent,
      message: `Compressing (quality: ${Math.round(quality * 100)}%)...`,
    });

    if (compressedBlob.size <= MAX_IMAGE_SIZE) break;

    quality -= 0.1;
    if (quality < 0.1) break;
  }

  if (!compressedBlob || compressedBlob.size > MAX_IMAGE_SIZE) {
    emit(onProgress, {
      stage: "error",
      percent: 0,
      message: "Could not compress image enough",
    });
    throw new Error("Image compression failed to meet size limit");
  }

  img.close();

  const saved = originalSize - compressedBlob.size;
  const stats = getStats();
  stats.totalSaved += saved;
  stats.imagesCompressed += 1;
  saveStats(stats);

  const fileName = file.name.replace(/\.[^.]+$/, ".jpg");

  emit(onProgress, {
    stage: "done",
    percent: 100,
    message: `Compressed! Saved ${formatBytes(saved)}`,
  });

  return new File([compressedBlob], fileName, { type: "image/jpeg" });
}

export async function compressAudio(
  file: File,
  onProgress?: ProgressCallback
): Promise<File> {
  emit(onProgress, {
    stage: "reading",
    percent: 0,
    message: "Reading audio file...",
  });

  const originalSize = file.size;

  if (originalSize <= MAX_SONG_SIZE) {
    emit(onProgress, {
      stage: "done",
      percent: 100,
      message: "Audio already within limits",
    });
    return file;
  }

  const arrayBuffer = await file.arrayBuffer();

  emit(onProgress, {
    stage: "reading",
    percent: 20,
    message: "Decoding audio...",
  });

  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  audioCtx.close();

  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  emit(onProgress, {
    stage: "compressing",
    percent: 30,
    message: `Encoding ${formatDuration(duration)} @ 128kbps...`,
  });

  const { Mp3Encoder } = await import("lamejs");

  const bitrates = [128, 96, 64];
  let compressedBlob: Blob | null = null;
  let usedBitrate = 128;

  for (const bitrate of bitrates) {
    const encoder = new Mp3Encoder(channels, sampleRate, bitrate);
    const mp3Data: Int8Array[] = [];

    const channelData: Float32Array[] = [];
    for (let c = 0; c < channels; c++) {
      channelData.push(audioBuffer.getChannelData(c));
    }

    const sampleBlockSize = 1152;
    const totalBlocks = Math.ceil(channelData[0].length / sampleBlockSize);
    let encodedBlocks = 0;

    for (let i = 0; i < channelData[0].length; i += sampleBlockSize) {
      if (channels === 1) {
        const block = channelData[0].subarray(i, i + sampleBlockSize);
        const blockInt = new Int16Array(block.length);
        for (let j = 0; j < block.length; j++) {
          blockInt[j] = Math.round(
            Math.max(-1, Math.min(1, block[j])) * 32767
          );
        }
        const mp3Buf = encoder.encodeBuffer(blockInt);
        if (mp3Buf.length > 0) mp3Data.push(mp3Buf);
      } else {
        const left = channelData[0].subarray(i, i + sampleBlockSize);
        const right = channelData[1].subarray(i, i + sampleBlockSize);
        const leftInt = new Int16Array(left.length);
        const rightInt = new Int16Array(right.length);
        for (let j = 0; j < left.length; j++) {
          leftInt[j] = Math.round(
            Math.max(-1, Math.min(1, left[j])) * 32767
          );
          rightInt[j] = Math.round(
            Math.max(-1, Math.min(1, right[j])) * 32767
          );
        }
        const mp3Buf = encoder.encodeBuffer(leftInt, rightInt);
        if (mp3Buf.length > 0) mp3Data.push(mp3Buf);
      }

      encodedBlocks++;
      const pct = Math.round(
        30 + (encodedBlocks / totalBlocks) * 50
      );
      emit(onProgress, {
        stage: "compressing",
        percent: Math.min(pct, 80),
        message: `Encoding @ ${bitrate}kbps (${encodedBlocks}/${totalBlocks})...`,
      });
    }

    const finalBuf = encoder.flush();
    if (finalBuf.length > 0) mp3Data.push(finalBuf);

    const totalLength = mp3Data.reduce((sum, buf) => sum + buf.length, 0);
    const merged = new Int8Array(totalLength);
    let offset = 0;
    for (const buf of mp3Data) {
      merged.set(buf, offset);
      offset += buf.length;
    }

    compressedBlob = new Blob([merged], { type: "audio/mp3" });
    usedBitrate = bitrate;

    if (compressedBlob.size <= MAX_SONG_SIZE) break;

    emit(onProgress, {
      stage: "compressing",
      percent: 85,
      message: `${formatBytes(compressedBlob.size)} — trying lower bitrate...`,
    });
  }

  if (
    !compressedBlob ||
    compressedBlob.size > MAX_SONG_SIZE
  ) {
    emit(onProgress, {
      stage: "error",
      percent: 0,
      message: "Could not compress audio enough",
    });
    throw new Error("Audio compression failed to meet size limit");
  }

  const saved = originalSize - compressedBlob.size;
  const stats = getStats();
  stats.totalSaved += saved;
  stats.songsCompressed += 1;
  saveStats(stats);

  const fileName = file.name.replace(/\.[^.]+$/, ".mp3");

  emit(onProgress, {
    stage: "done",
    percent: 100,
    message: `Compressed! ${formatBytes(saved)} saved @ ${usedBitrate}kbps`,
  });

  return new File([compressedBlob], fileName, { type: "audio/mp3" });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 2);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}