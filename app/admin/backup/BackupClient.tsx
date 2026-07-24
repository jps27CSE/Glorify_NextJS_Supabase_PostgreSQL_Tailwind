"use client";

import { useState } from "react";
import { FiDownload, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const BackupClient = () => {
  const [status, setStatus] = useState<"idle" | "downloading" | "done" | "error">("idle");

  const handleDownload = async () => {
    try {
      setStatus("downloading");

      const res = await fetch("/api/admin/export");

      if (!res.ok) {
        setStatus("error");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers
        .get("Content-Disposition")
        ?.split("filename=")[1]
        ?.replace(/"/g, "") || `glorify-backup-${new Date().toISOString().split("T")[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus("done");
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleDownload}
        disabled={status === "downloading"}
        className="flex items-center gap-x-2 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-black font-semibold px-5 py-3 rounded-lg transition text-sm"
      >
        {status === "downloading" ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating backup...
          </>
        ) : (
          <>
            <FiDownload size={18} />
            Download Full Backup
          </>
        )}
      </button>

      {status === "done" && (
        <div className="flex items-center gap-x-2 text-sm text-green-400">
          <FiCheckCircle size={16} />
          Backup downloaded successfully
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-x-2 text-sm text-red-400">
          <FiAlertCircle size={16} />
          Backup failed. Check server logs.
        </div>
      )}

      {status === "downloading" && (
        <p className="text-xs text-neutral-500">
          This may take a few minutes depending on the number of audio files.
        </p>
      )}
    </div>
  );
};

export default BackupClient;
