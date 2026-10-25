/**
 * Module A: Parent Dashboard
 * Overview of both learners, current weekly debate cards, quick actions, history, and curriculum journey
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Printer,
  RotateCw,
  PlusCircle,
  Award,
  ArrowRight,
  TrendingUp,
  FileEdit,
  Shield,
  Lightbulb,
  Check,
  CalendarDays
} from 'lucide-react';
import { DebateTopic, Learner } from '../types/debate';

export const Dashboard: React.FC = () => {
  const {
    data,
    setActiveTab,
    setSelectedLearnerId,
    setSelectedTopicId,
    setSelectedPackId,
    generateNewTopic,
    generatePackForTopic,
    markSessionComplete,
    isGeneratingTopic,
    isGeneratingPack
  } = useApp();

  const handleOpenPack = (topic: DebateTopic) => {
    setSelectedLearnerId(topic.learnerId);
    setSelectedTopicId(topic.id);
    if (topic.packId && data.packs[topic.packId]) {
      setSelectedPackId(topic.packId);
    }
    setActiveTab('weekly-debates');
  };

  const handleGenerateTopicForLearner = async (learnerId: string) => {
    setSelectedLearnerId(learnerId);
    await generateNewTopic(learnerId);
  };

  const handleGeneratePackForTopic = async (topic: DebateTopic) => {
    setSelectedLearnerId(topic.learnerId);
    setSelectedTopicId(topic.id);
    const pack = await generatePackForTopic(topic.id);
    if (pack) {
      setActiveTab('weekly-debates');
    }
  };

  const getStatusBadge = (status: DebateTopic['completionStatus']) => {
    switch (status) {
      case 'Ready for practice':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Ready for Practice
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Completed & Assessed
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Topic Approved (Needs Pack)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200">
            Not Generated
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-linear-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-700/50 text-emerald-200 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>
              Week {data.currentWeekNumber} Coaching Cycle • Preferred Debate Day:{' '}
              {data.preferredDebateDay}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Weekly Debate Command Center
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-6">
            Empower your children to speak with poise, evaluate evidence respectfully, and construct
            persuasive arguments grounded in Nigerian civic life. Every week delivers tailored,
            age-differentiated debate materials.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('topic-library')}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Topics with Gemini</span>
            </button>
            <button
              onClick={() => setActiveTab('parent-guide')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-white/15 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Parent Coaching Handbook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Learners Weekly Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Current Week Debate Cards</h3>
            <p className="text-xs text-gray-700">
              Distinct age-tailored preparation materials for each child
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Week {data.currentWeekNumber}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.learners.map((learner) => {
            const isJSS = learner.classLevel.includes('JSS');
            // Find active topic for current week, or the latest topic
            const activeTopic =
              data.topics.find(
                (t) => t.learnerId === learner.id && t.weekNumber === data.currentWeekNumber
              ) || data.topics.find((t) => t.learnerId === learner.id);

            const hasPack = activeTopic?.packId && !!data.packs[activeTopic.packId];
            const pack = hasPack ? data.packs[activeTopic!.packId!] : null;

            return (
              <div
                key={learner.id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between ${
                  isJSS ? 'border-blue-100 hover:border-blue-200' : 'border-emerald-100 hover:border-emerald-200'
                }`}
              >
                {/* Card Header */}
                <div
                  className={`p-5 border-b ${
                    isJSS
                      ? 'bg-linear-to-r from-blue-50/70 to-indigo-50/40 border-blue-100/80'
                      : 'bg-linear-to-r from-emerald-50/70 to-teal-50/40 border-emerald-100/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm ${
                          isJSS ? 'bg-blue-600' : 'bg-emerald-600'
                        }`}
                      >
                        {learner.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-base">{learner.name}</h4>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              isJSS ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {learner.classLevel} ({learner.age} yrs)
                          </span>
                        </div>
                        <p className="text-xs text-gray-700">
                          Stage {learner.currentStage} • Target: {learner.preferredDuration} speech
                        </p>
                      </div>
                    </div>

                    <div>{getStatusBadge(activeTopic?.completionStatus || 'Not generated')}</div>
                  </div>

                  <div className="text-xs text-gray-700 flex items-center gap-2 mt-2 pt-2 border-t border-black/5">
                    <span className="font-medium">Focus Area:</span>
                    <span className="text-gray-800 truncate">{learner.targetGoal}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {activeTopic ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-700">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                          {activeTopic.category}
                        </span>
                        <span className="text-gray-700">Week {activeTopic.weekNumber}</span>
                      </div>

                      <div>
                        <h5 className="font-bold text-gray-900 text-base leading-snug mb-1">
                          {activeTopic.title}
                        </h5>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-800 italic leading-relaxed">
                          "{activeTopic.motion}"
                        </div>
                      </div>

                      {hasPack ? (
                        <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="p-1">
                            <span className="text-[10px] text-gray-700 block">Arguments</span>
                            <span className="font-bold text-gray-800">
                              {pack?.propositionArguments.length} For / {pack?.oppositionArguments.length} Against
                            </span>
                          </div>
                          <div className="p-1 border-x border-gray-200">
                            <span className="text-[10px] text-gray-700 block">Rebuttals</span>
                            <span className="font-bold text-gray-800">
                              {pack?.rebuttals.length} Prepared
                            </span>
                          </div>
                          <div className="p-1">
                            <span className="text-[10px] text-gray-700 block">Prep Time</span>
                            <span className="font-bold text-gray-800">
                              {pack?.estimatedPrepTimeMinutes} mins
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                          <span>Debate topic approved! Generate preparation pack to start practice.</span>
                          <button
                            onClick={() => handleGeneratePackForTopic(activeTopic)}
                            disabled={isGeneratingPack}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs ml-2 cursor-pointer transition disabled:opacity-50"
                          >
                            {isGeneratingPack ? 'Generating...' : 'Generate Pack'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        No Topic Generated for Week {data.currentWeekNumber}
                      </p>
                      <p className="text-xs text-gray-700 mb-4 max-w-sm mx-auto">
                        Generate an age-appropriate Nigerian civic debate topic tailored specifically for{' '}
                        {learner.name}.
                      </p>
                      <button
                        onClick={() => handleGenerateTopicForLearner(learner.id)}
                        disabled={isGeneratingTopic}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isGeneratingTopic ? 'Generating...' : 'Generate Week Topic'}</span>
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {activeTopic && (
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                      {hasPack ? (
                        <>
                          <button
                            onClick={() => handleOpenPack(activeTopic)}
                            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Open Debate Pack</span>
                          </button>
                          <button
                            onClick={() => {
                              handleOpenPack(activeTopic);
                              setTimeout(() => window.print(), 350);
                            }}
                            className="inline-flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                            title="Print Preparation Booklet"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </button>
                          {activeTopic.completionStatus !== 'Completed' ? (
                            <button
                              onClick={() => markSessionComplete(activeTopic.id)}
                              className="inline-flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                              title="Mark session as complete"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Done</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-blue-700 font-semibold px-2 py-1 bg-blue-50 rounded-lg border border-blue-200">
                              ✓ Assessed
                            </span>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleGeneratePackForTopic(activeTopic)}
                          disabled={isGeneratingPack}
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isGeneratingPack ? 'Creating Full Pack...' : 'Generate Complete Debate Pack'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedLearnerId(learner.id);
                          setActiveTab('topic-library');
                        }}
                        className="text-xs text-gray-700 hover:text-emerald-700 font-medium py-1 px-2 transition cursor-pointer ml-auto"
                      >
                        Change Topic →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curriculum Framework & Progression Road Map */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Nigerian Civic Debate Curriculum Journey
            </h3>
            <p className="text-xs text-gray-700">
              5 progressive stages supporting a full academic school year across 12 civic categories
            </p>
          </div>
          <button
            onClick={() => setActiveTab('parent-guide')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full 12-Category Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { stage: 1, name: 'Expressing an Opinion', age: 'P4 Start', focus: 'Positions & Simple Reasons' },
            { stage: 2, name: 'Supporting with Reasons', age: 'P4 Target', focus: 'Concrete Nigerian Examples' },
            { stage: 3, name: 'Opposing Views', age: 'Bridge Level', focus: 'Listening & Polite Rebuttals' },
            { stage: 4, name: 'Stronger Arguments', age: 'JSS 1 Target', focus: 'P-R-E-L & Counterarguments' },
            { stage: 5, name: 'Independent Debate', age: 'Advanced', focus: 'Original Speeches & Analysis' }
          ].map((s) => (
            <div
              key={s.stage}
              className="p-3.5 rounded-xl border border-gray-100 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-emerald-800">Stage {s.stage}</span>
                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                  {s.age}
                </span>
              </div>
              <h5 className="font-semibold text-gray-900 text-xs mb-1">{s.name}</h5>
              <p className="text-[11px] text-gray-700 leading-tight">{s.focus}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly History & Recent Debates Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Debate History & Past Sessions</h3>
            <p className="text-xs text-gray-700">
              Revisit, revise, or review previously completed debate topics
            </p>
          </div>
          <button
            onClick={() => setActiveTab('topic-library')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Generate Next Week in Advance</span>
            <PlusCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.topics.length === 0 ? (
          <p className="text-xs text-gray-700 italic py-4 text-center">
            No previous topics recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.topics.map((t) => {
              const learner = data.learners.find((l) => l.id === t.learnerId);
              const isJSS = t.learnerClass.includes('JSS');
              const hasPack = t.packId && !!data.packs[t.packId];

              return (
                <div
                  key={t.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 px-2 rounded-xl transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isJSS ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.learnerName} ({t.learnerClass})
                      </span>
                      <span className="text-xs font-semibold text-gray-700">Week {t.weekNumber}</span>
                      <span className="text-xs text-gray-700">•</span>
                      <span className="text-xs text-gray-700">{t.category}</span>
                    </div>
                    <h5 className="font-semibold text-sm text-gray-900">{t.title}</h5>
                    <p className="text-xs text-gray-700 italic line-clamp-1">"{t.motion}"</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {getStatusBadge(t.completionStatus)}
                    {hasPack ? (
                      <button
                        onClick={() => handleOpenPack(t)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs"
                      >
                        Open Pack
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGeneratePackForTopic(t)}
                        disabled={isGeneratingPack}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        Build Pack
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
