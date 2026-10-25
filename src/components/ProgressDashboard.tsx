/**
 * Module E: Progress Tracking, Assessment History & Achievement Certificates
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { assessSpeechApi } from '../services/api';
import {
  Award,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Printer,
  Sparkles,
  MessageSquare,
  Star,
  Users,
  Target,
  ArrowRight
} from 'lucide-react';

export const ProgressDashboard: React.FC = () => {
  const { data, selectedLearnerId, setSelectedLearnerId } = useApp();

  const activeLearner =
    data.learners.find((l) => l.id === selectedLearnerId) || data.learners[0];

  const learnerAssessments = data.assessments.filter((a) => a.learnerId === activeLearner.id);

  // AI Speech Feedback Assistant
  const [sessionNotes, setSessionNotes] = useState('');
  const [isAssessingWithAi, setIsAssessingWithAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);

  const handleRunAiFeedback = async () => {
    setIsAssessingWithAi(true);
    try {
      const activeTopic = data.topics.find((t) => t.learnerId === activeLearner.id);
      const res = await assessSpeechApi(
        sessionNotes,
        activeLearner,
        activeTopic?.motion || 'Weekly Debate Motion'
      );
      if (res.success && res.feedback) {
        setAiFeedback(res.feedback);
      }
    } catch (err) {
      console.error('AI assessment error:', err);
    } finally {
      setIsAssessingWithAi(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Coaching Feedback & Growth
              </span>
              <span className="text-xs text-gray-700">1 to 4 Rubric Milestones</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Debate Progress & Weekly Assessments
            </h2>
            <p className="text-xs text-gray-700 mt-1 max-w-2xl">
              Track growth in logical reasoning, voice clarity, respectful rebuttal, and independent
              thinking without pressure or comparison between siblings.
            </p>
          </div>

          {/* Learner Switcher */}
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            {data.learners.map((learner) => {
              const isSelected = learner.id === activeLearner.id;
              return (
                <button
                  key={learner.id}
                  onClick={() => {
                    setSelectedLearnerId(learner.id);
                    setAiFeedback(null);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  {learner.name} ({learner.classLevel})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs text-gray-700 font-semibold block mb-1">Total Assessed</span>
          <div className="text-2xl font-extrabold text-gray-900">
            {learnerAssessments.length} <span className="text-xs font-normal text-gray-700">sessions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs text-gray-700 font-semibold block mb-1">Current Stage</span>
          <div className="text-xl font-extrabold text-emerald-800">
            Stage {activeLearner.currentStage}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs text-gray-700 font-semibold block mb-1">Speaking Confidence</span>
          <div className="text-lg font-bold text-gray-900">
            {activeLearner.confidenceLevel}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs text-gray-700 font-semibold block mb-1">Speaking Target</span>
          <div className="text-lg font-bold text-gray-900">
            {activeLearner.preferredDuration}
          </div>
        </div>
      </div>

      {/* AI Speech Coaching Companion */}
      <div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-gray-900">
              AI Speech Coach: Quick Feedback Assistant
            </h3>
          </div>
          <span className="text-xs text-emerald-800 font-medium">Gemini 3.8 Flash</span>
        </div>

        <p className="text-xs text-gray-700">
          Type or paste any notes from {activeLearner.name}'s latest practice session (e.g. how they spoke, what they forgot, where they hesitated), and Gemini will generate warm, constructive coaching advice for next week.
        </p>

        <div className="space-y-3">
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder={`e.g. ${activeLearner.name} stood tall and delivered the greeting confidently! Paused for 3 seconds on argument 2, but smiled and gave a great Nigerian school example.`}
            className="w-full h-24 p-3 text-xs text-gray-800 bg-white border border-emerald-200 rounded-xl focus:outline-emerald-500 resize-none shadow-2xs"
          />

          <button
            onClick={handleRunAiFeedback}
            disabled={isAssessingWithAi || !sessionNotes.trim()}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAssessingWithAi ? 'Analyzing Delivery...' : 'Get Developmental Coaching Feedback'}</span>
          </button>
        </div>

        {aiFeedback && (
          <div className="mt-4 p-5 bg-white rounded-xl border border-emerald-200 space-y-3 text-xs">
            <h4 className="font-bold text-sm text-emerald-950">
              🌟 Coaching Insights for {activeLearner.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-0.5">What Went Well:</span>
                <p className="text-emerald-950">{aiFeedback.whatWentWell}</p>
              </div>
              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                <span className="font-bold text-amber-900 block mb-0.5">Gentle Target:</span>
                <p className="text-amber-950">{aiFeedback.improvementTarget}</p>
              </div>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-blue-950">
              💡 <strong>Parent Coaching Tip:</strong> {aiFeedback.coachingTip}
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-gray-800">
              🎯 <strong>Next Mini-Goal for {activeLearner.name}:</strong> {aiFeedback.suggestedNextGoal}
            </div>
          </div>
        )}
      </div>

      {/* Completed Session History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-gray-900">
          Recorded Assessments for {activeLearner.name}
        </h3>

        {learnerAssessments.length === 0 ? (
          <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Award className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">No formal assessments recorded yet</p>
            <p className="text-xs text-gray-700 mt-1 max-w-sm mx-auto">
              After finishing a home debate session in the "Weekly Debates" tab, complete the 1-to-4 rubric to record {activeLearner.name}'s progress.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {learnerAssessments.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-2xl border border-gray-200 bg-slate-50/60 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200">
                  <div>
                    <span className="text-xs text-gray-700 font-semibold">{a.date}</span>
                    <h5 className="font-bold text-sm text-gray-900">{a.topicTitle}</h5>
                    <p className="text-xs text-gray-700 italic">"{a.motion}"</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                      Score: {a.totalScore} / {a.maxScore}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="font-bold text-emerald-800 block mb-0.5">🌟 What went well:</span>
                    <p className="text-gray-800">{a.whatChildDidWell}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="font-bold text-amber-800 block mb-0.5">🎯 Next Improvement Target:</span>
                    <p className="text-gray-800">{a.oneImprovementTarget}</p>
                  </div>
                </div>

                {a.childReflection && (
                  <div className="text-xs bg-white p-3 rounded-xl border border-gray-100 text-gray-800">
                    <span className="font-bold text-gray-900 block mb-0.5">
                      💭 {activeLearner.name}'s Reflection:
                    </span>
                    <p className="italic">"{a.childReflection}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Printable Milestone Certificate Card */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-emerald-700/60 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
            <Award className="w-4 h-4 text-emerald-300" />
            <span>Debate Effort Certificate</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Celebrate {activeLearner.name}'s Public Speaking Courage
          </h3>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            Print a personalized Certificate of Achievement to reward courage, critical thinking,
            and respectful debate participation. Children cherish seeing their efforts recognized!
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition shadow-md cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print Debate Certificate</span>
        </button>
      </div>
    </div>
  );
};
