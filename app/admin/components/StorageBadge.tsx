"use client";

import { useEffect, useState } from "react";
import { FiHardDrive } from "react-icons/fi";

interface StorageData {
  used: number;
  limit: number | null;
  remaining: number | null;
  percentage: number | null;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const StorageBadge = () => {
  const [data, setData] = useState<StorageData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/storage");
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silently fail
      }
    };
    fetchStats();
  }, []);

  if (!data) return null;

  return (
    <div className="px-4 py-3 border-t border-neutral-800">
      <div className="flex items-center gap-x-2 text-neutral-500 mb-1.5">
        <FiHardDrive size={12} />
        <span className="text-[11px] font-medium uppercase tracking-wider">
          Storage
        </span>
      </div>
      {data.limit !== null ? (
        <>
          <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                data.percentage! > 80
                  ? "bg-red-500"
                  : data.percentage! > 60
                  ? "bg-amber-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${data.percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-neutral-600">
              {formatBytes(data.used)}
            </span>
            <span className="text-[10px] text-neutral-600">
              {formatBytes(data.limit)}
            </span>
          </div>
        </>
      ) : (
        <p className="text-xs text-neutral-500">{formatBytes(data.used)} used</p>
      )}
    </div>
  );
};

export default StorageBadge;