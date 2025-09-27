"use client";

import { useEffect, useState } from "react";

export default function OrderSuccess({
  message = "Sit back and relax — your order has been placed.",
  autoDismissMs = 6000,
}: {
  message?: string;
  autoDismissMs?: number;
}) {
  const [visible, setVisible] = useState(true);
  const [removed, setRemoved] = useState(false);
  const fadeMs = 700; // keep in sync with transition duration

  useEffect(() => {
    if (!autoDismissMs) return;
    const t = setTimeout(() => setVisible(false), autoDismissMs);
    return () => clearTimeout(t);
  }, [autoDismissMs]);

  // After fade completes, unmount to remove layout gap
  useEffect(() => {
    if (!visible) {
      const tr = setTimeout(() => setRemoved(true), fadeMs + 50);
      return () => clearTimeout(tr);
    }
  }, [visible]);

  if (removed) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14">
          <svg viewBox="0 0 52 52" className="h-14 w-14">
            <circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              className="stroke-current text-green-200"
              strokeWidth="2"
            />
            <circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              strokeWidth="2"
              className="stroke-current text-green-500 [stroke-dasharray:151] [stroke-dashoffset:151] animate-[dash_0.6s_ease-out_forwards]"
            />
            <path
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-current text-green-600 [stroke-dasharray:36] [stroke-dashoffset:36] animate-[dash_0.4s_0.4s_ease-out_forwards]"
              d="M16 26l7 7 13-14"
            />
          </svg>
        </div>
        <div>
          <div className="text-lg font-semibold">Order Placed!</div>
          <div className="text-sm text-muted-foreground">{message}</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
