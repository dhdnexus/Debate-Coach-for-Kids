/**
 * Interactive Practice Mode with Step Timer, Audio Chimes, and Parent Prompts
 */

import React, { useState, useEffect, useRef } from 'react';
import { DebatePack } from '../types/debate';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  Clock,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface InteractivePracticeModeProps {
  pack: DebatePack;
  onFinishPractice: () => void;
}

export const InteractivePracticeMode: React.FC<InteractivePracticeModeProps> = ({
  pack,
  onFinishPractice
}) => {
  const isP4 = pack.learnerClass.includes('4') || pack.learnerAge <= 8;
  const steps = pack.debateStructure.steps;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex] || steps[0];

  const initialSeconds = (currentStep.durationMinutes || 2) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [notes, setNotes] = useState('');

  // Audio chime via Web Audio API
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('AudioContext chime not available', e);
    }
  };

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  // When step changes, reset timer
  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      const newSec = (steps[index].durationMinutes || 2) * 60;
      setSecondsRemaining(newSec);
      setIsRunning(false);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      playChime();
      onFinishPractice();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining((currentStep.durationMinutes || 2) * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-emerald-200 shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-700/80 text-emerald-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              Live Practice Mode
            </span>
            <span className="text-emerald-200 text-xs">
              {isP4 ? 'Primary 4 Home Practice Session' : 'JSS 1 Structured Debate'}
            </span>
          </div>

          <div className="text-xs text-emerald-200">
            Step {currentStepIndex + 1} of {steps.length} ({progressPercent}%)
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">"{pack.motion}"</h3>
        <p className="text-xs text-emerald-100/80">
          Learner: <span className="font-semibold text-white">{pack.learnerName}</span> ({pack.learnerClass})
        </p>

        {/* Progress bar */}
        <div className="w-full bg-emerald-950/50 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timer & Main Speaker Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Role: {currentStep.speakerRole}
                </span>
                <h4 className="text-lg font-bold text-gray-900 mt-0.5">{currentStep.title}</h4>
              </div>
              <span className="text-xs font-semibold bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-700">
                Target: {currentStep.durationMinutes} min
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {currentStep.description}
            </p>

            {/* Parent Tip Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Parent Coach Tip:</span>
                <span>{currentStep.parentTip}</span>
              </div>
            </div>
          </div>

          {/* Big Timer Display */}
          <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 text-center shadow-xs">
            <div className="text-6xl sm:text-7xl font-mono font-extrabold text-gray-900 tracking-tight mb-4">
              {formatTime(secondsRemaining)}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition shadow-md cursor-pointer ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Speaking Time</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetTimer}
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer"
                title="Reset this step timer"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                onClick={playChime}
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-3 rounded-xl text-sm font-semibold transition cursor-pointer"
                title="Sound chime bell"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              <span>{currentStepIndex === steps.length - 1 ? 'Finish & Complete Rubric' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Coaching Cheat Sheet & Quick Notes */}
        <div className="space-y-6">
          {/* Quick Prompts */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Helpful Parent Prompts</span>
            </h5>
            <ul className="text-xs text-gray-700 space-y-2">
              <li className="bg-white p-2 rounded-lg border border-gray-100">
                🗣️ "What is your strongest reason?"
              </li>
              <li className="bg-white p-2 rounded-lg border border-gray-100">
                🇳🇬 "Can you give me an example from your school or home?"
              </li>
              <li className="bg-white p-2 rounded-lg border border-gray-100">
                🤝 "What might the other side say, and how can you answer politely?"
              </li>
              <li className="bg-white p-2 rounded-lg border border-gray-100">
                🧘 "Take a breath. Speak like you are telling your best friend."
              </li>
            </ul>
          </div>

          {/* Rebuttal Quick Starters */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
            <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2">
              Magic Debate Phrases
            </h5>
            <div className="text-xs text-amber-900 space-y-1.5 font-medium">
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200/50">
                "I understand that point, but..."
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200/50">
                "Another way to look at this is..."
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200/50">
                "My opponent raised a fair point. However..."
              </div>
            </div>
          </div>

          {/* Quick Notes for Rubric Assessment */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
            <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
              Debate Session Notes
            </h5>
            <p className="text-[11px] text-gray-700 mb-2">
              Jot down what {pack.learnerName} did well and what to improve:
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Great posture, smiled, clear voice! Forgot to mention second example."
              className="w-full h-24 p-2.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-emerald-500 focus:border-emerald-500 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
