"use client";

import { useState, useEffect } from "react";

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const TIMER_CONFIG = {
  pomodoro: 1,
  shortBreak: 5,
  longBreak: 20
};

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(TIMER_CONFIG.pomodoro);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [pomodoroCount, setPomodoroCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (mode === 'pomodoro') {
              const newCount = pomodoroCount + 1;
              setPomodoroCount(newCount);
              setMode(newCount % 4 === 0 ? 'longBreak' : 'shortBreak');
              setMinutes(newCount % 4 === 0 ? TIMER_CONFIG.longBreak : TIMER_CONFIG.shortBreak);
            } else {
              setMode('pomodoro');
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

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => changeMode('pomodoro')}
          className={`rounded-full px-4 py-2 font-semibold transition ${
            mode === 'pomodoro' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => changeMode('shortBreak')}
          className={`rounded-full px-4 py-2 font-semibold transition ${
            mode === 'shortBreak' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => changeMode('longBreak')}
          className={`rounded-full px-4 py-2 font-semibold transition ${
            mode === 'longBreak' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Long Break
        </button>
      </div>
      <div className="text-6xl font-bold">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex gap-4">
        <button
          onClick={toggleTimer}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          Reset
        </button>
      </div>
      <div className="text-xl">
        {mode === 'pomodoro' ? 'Focus Time' : 'Break Time!'}
      </div>
      <div className="text-sm">
        Pomodoros completed: {pomodoroCount}
      </div>
    </div>
  );
}