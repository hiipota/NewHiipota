"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { Clock } from "lucide-react";
import { clsx } from "clsx";

const IDLE_TIME = 15 * 60; // 15 minutes in seconds

export default function IdleTimer() {
  const [timeLeft, setTimeLeft] = useState(IDLE_TIME);

  const resetTimer = useCallback(() => {
    setTimeLeft(IDLE_TIME);
  }, []);

  useEffect(() => {
    // Events to reset the timer
    const events = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          signOut({ callbackUrl: "/" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, [resetTimer]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft <= 60;

  return (
    <div
      className={clsx(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white shadow-sm transition-colors duration-500",
        isWarning
          ? "border-red-200 text-red-600 bg-red-50 animate-pulse"
          : "border-gray-200 text-slate-600"
      )}
    >
      <Clock className={clsx("w-4 h-4", isWarning && "text-red-500")} />
      <span className="text-sm font-mono font-semibold w-[42px]">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
