"use client";

import { useState, useEffect } from "react";
import { PlayIcon, PauseIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

const TIMER_CONFIG = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 20,
};

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(TIMER_CONFIG.pomodoro);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [pomodoroCount, setPomodoroCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (mode === "pomodoro") {
              const newCount = pomodoroCount + 1;
              setPomodoroCount(newCount);
              setMode(newCount % 4 === 0 ? "longBreak" : "shortBreak");
              setMinutes(
                newCount % 4 === 0
                  ? TIMER_CONFIG.longBreak
                  : TIMER_CONFIG.shortBreak,
              );
            } else {
              setMode("pomodoro");
              setMinutes(TIMER_CONFIG.pomodoro);
            }
            return;
          }
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, pomodoroCount]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(TIMER_CONFIG[mode]);
    setSeconds(0);
  };

  const changeMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(TIMER_CONFIG[newMode]);
    setSeconds(0);
  };

  const getProgress = () => {
    const totalSeconds = TIMER_CONFIG[mode] * 60;
    const currentSeconds = minutes * 60 + seconds;
    return ((totalSeconds - currentSeconds) / totalSeconds) * 100;
  };

  const getModeInfo = () => {
    switch (mode) {
      case "pomodoro":
        return {
          label: "Focus Time",
          color: "text-primary-600",
          bgColor: "bg-primary-50",
        };
      case "shortBreak":
        return {
          label: "Short Break",
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "longBreak":
        return {
          label: "Long Break",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        };
    }
  };

  const modeInfo = getModeInfo();
  const progress = getProgress();

  return (
    <div className="shadow-study-lg rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Pomodoro Timer</h3>
      </div>

      {/* Mode Selection */}
      <div className="mb-6 flex gap-2">
        {(["pomodoro", "shortBreak", "longBreak"] as const).map((timerMode) => (
          <button
            key={timerMode}
            onClick={() => changeMode(timerMode)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
              mode === timerMode
                ? "bg-primary-100 text-primary-700 border-primary-200 border"
                : "border border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {timerMode === "pomodoro" && "Focus"}
            {timerMode === "shortBreak" && "Short Break"}
            {timerMode === "longBreak" && "Long Break"}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="mb-6 text-center">
        <div
          className={`inline-flex h-32 w-32 items-center justify-center rounded-full ${modeInfo.bgColor} relative mb-4`}
        >
          <svg
            className="absolute inset-0 h-full w-full -rotate-90 transform"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className={
                mode === "pomodoro"
                  ? "text-primary-500"
                  : mode === "shortBreak"
                    ? "text-green-500"
                    : "text-purple-500"
              }
              strokeDasharray={`${progress * 2.83} 283`}
              style={{ transition: "stroke-dasharray 1s ease-in-out" }}
            />
          </svg>
          <div className="text-3xl font-bold text-slate-800">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
        </div>
        <p className={`text-sm font-medium ${modeInfo.color}`}>
          {modeInfo.label}
        </p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex justify-center gap-3">
        <button
          onClick={toggleTimer}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-200 ${
            isActive
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-primary-600 hover:bg-primary-700 transform text-slate-700 shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
          }`}
        >
          {isActive ? (
            <>
              <PauseIcon className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4" />
              Start
            </>
          )}
        </button>
        <button
          onClick={resetTimer}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-200"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Reset
        </button>
      </div>

      {/* Stats */}
      <div className="text-center">
        <p className="text-sm text-slate-600">
          Pomodoros completed:{" "}
          <span className="text-primary-600 font-semibold">
            {pomodoroCount}
          </span>
        </p>
      </div>
    </div>
  );
}
