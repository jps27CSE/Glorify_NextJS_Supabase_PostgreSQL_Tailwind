"use client";

import { CompressProgress } from "@/utils/compress";

interface Props {
  progress: CompressProgress;
  label: string;
}

const CompressionProgress: React.FC<Props> = ({ progress, label }) => {
  const isActive = progress.stage === "compressing" || progress.stage === "reading";
  const isDone = progress.stage === "done";
  const isError = progress.stage === "error";

  const ringColor = isDone
    ? "stroke-green-500"
    : isError
    ? "stroke-red-500"
    : "stroke-green-500";

  const textColor = isDone
    ? "text-green-400"
    : isError
    ? "text-red-400"
    : "text-white";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (progress.percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-y-3 py-4">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgb(38 38 38)"
            strokeWidth="4"
          />
          {isActive && (
            <>
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke="rgb(38 38 38)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle
                cx="60"
                cy="60"
                r="34"
                fill="none"
                stroke="rgb(38 38 38)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </>
          )}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            className={ringColor}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
        </svg>

        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
            <div className="w-1 h-[60%] bg-gradient-to-t from-transparent via-green-500/60 to-green-500 origin-bottom rounded-full" />
          </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${textColor}`}>
            {progress.percent}%
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-neutral-400 uppercase tracking-wider">
          {label}
        </p>
        <p className={`text-sm mt-0.5 ${textColor}`}>{progress.message}</p>
      </div>
    </div>
  );
};

export default CompressionProgress;