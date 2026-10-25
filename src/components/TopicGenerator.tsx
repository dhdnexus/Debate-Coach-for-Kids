/**
 * Module C: Weekly Topic Generator & Curriculum Library
 * Generates age-differentiated Nigerian debate motions with Gemini, preview, accept/reject, category filters, and difficulty adjustments
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TOPIC_CATEGORIES,
  TopicCategory,
  DebateTopic
} from '../types/debate';
import { CURRICULUM_BANK } from '../data/curriculumTopics';
import {
  Sparkles,
  Check,
  X,
  RotateCcw,
  BookOpen,
  Filter,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Plus
} from 'lucide-react';

export const TopicGenerator: React.FC = () => {
  const {
    data,
    selectedLearnerId,
    setSelectedLearnerId,
    generateNewTopic,
    acceptTopic,
    rejectTopic,
    generatePackForTopic,
    isGeneratingTopic,
    isGeneratingPack,
    generationError,
    generationWarning,
    setActiveTab,
    setSelectedTopicId,
    setSelectedPackId
  } = useApp();

  const activeLearner =
    data.learners.find((l) => l.id === selectedLearnerId) || data.learners[0];

  const [selectedCategory, setSelectedCategory] = useState<TopicCategory | ''>('');
  const [targetWeek, setTargetWeek] = useState<number>(data.currentWeekNumber);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Intermediate');
  const [previewTopic, setPreviewTopic] = useState<DebateTopic | null>(null);

  const pastMotions = data.topics
    .filter((t) => t.learnerId === activeLearner.id)
    .map((t) => t.motion);

  const handleGenerate = async () => {
    const topic = await generateNewTopic(
      activeLearner.id,
      selectedCategory || undefined,
      selectedDifficulty,
      targetWeek
    );
    if (topic) {
      setPreviewTopic(topic);
    }
  };

  const handleAcceptAndGeneratePack = async (topicToAccept: DebateTopic) => {
    await acceptTopic(topicToAccept.id);
    const pack = await generatePackForTopic(topicToAccept.id);
    if (pack) {
      setSelectedTopicId(topicToAccept.id);
      setSelectedPackId(pack.id);
      setActiveTab('weekly-debates');
    }
  };

  const isJSS = activeLearner.classLevel.includes('JSS');
  const isP4 = activeLearner.classLevel.includes('4') || activeLearner.age <= 8;

  // Filtered curriculum topics for the learner's age group
  const targetClass = isP4 ? 'Primary 4' : 'JSS 1';
  const curricularIdeas = CURRICULUM_BANK.filter(
    (item) =>
      (item.targetClass === targetClass || item.targetClass === 'Both') &&
      (!selectedCategory || item.category === selectedCategory)
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                AI Curriculum Engine
              </span>
              <span className="text-xs text-gray-700">Powered by Gemini 3.8 Flash</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Weekly Debate Topic Generator
            </h2>
            <p className="text-xs text-gray-700 mt-1 max-w-2xl">
              Generate balanced, age-tailored Nigerian civic debate motions. Select a specific
              category or allow Gemini to balance the 12-category progression road map.
            </p>
          </div>

          {/* Learner Selector */}
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            {data.learners.map((learner) => {
              const isSelected = learner.id === activeLearner.id;
              return (
                <button
                  key={learner.id}
                  onClick={() => {
                    setSelectedLearnerId(learner.id);
                    setPreviewTopic(null);
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

      {/* Generation Parameters & Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Configure Next Debate for {activeLearner.name}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Target Week */}
          <div>
            <label className="font-bold text-gray-900 block mb-1.5">Debate Week</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTargetWeek(data.currentWeekNumber)}
                className={`flex-1 py-2 px-3 rounded-xl border text-center font-semibold cursor-pointer ${
                  targetWeek === data.currentWeekNumber
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Current (Week {data.currentWeekNumber})
              </button>
              <button
                onClick={() => setTargetWeek(data.currentWeekNumber + 1)}
                className={`flex-1 py-2 px-3 rounded-xl border text-center font-semibold cursor-pointer ${
                  targetWeek === data.currentWeekNumber + 1
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next (Week {data.currentWeekNumber + 1})
              </button>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="font-bold text-gray-900 block mb-1.5">Curriculum Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TopicCategory)}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-emerald-500"
            >
              <option value="">✨ Any Suitable Category (Auto-Balanced)</option>
              {TOPIC_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="font-bold text-gray-900 block mb-1.5">Difficulty Level</label>
            <div className="flex items-center gap-1.5">
              {['Beginning', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedDifficulty(lvl)}
                  className={`flex-1 py-2 rounded-xl text-center font-semibold border cursor-pointer ${
                    selectedDifficulty === lvl
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-700">
            Past topics avoided:{' '}
            <strong className="text-gray-900">{pastMotions.length} motions in history</strong>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGeneratingTopic}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isGeneratingTopic ? 'Generating with Gemini...' : `Generate Topic for ${activeLearner.name}`}
            </span>
          </button>
        </div>

        {generationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{generationError}</span>
          </div>
        )}

        {generationWarning && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{generationWarning}</span>
          </div>
        )}
      </div>

      {/* Generated Topic Preview Card (if any pending) */}
      {previewTopic && (
        <div className="bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Newly Generated Topic Preview (Week {previewTopic.weekNumber})</span>
            </span>
            <span className="text-xs font-semibold bg-white border border-emerald-200 px-2.5 py-0.5 rounded-full text-emerald-900">
              {previewTopic.category}
            </span>
          </div>

          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">{previewTopic.title}</h4>
            <div className="p-4 bg-white rounded-xl border border-emerald-200 text-sm font-semibold text-emerald-950 italic">
              "{previewTopic.motion}"
            </div>
          </div>

          {previewTopic.suitabilityNotes && (
            <p className="text-xs text-gray-700 bg-white/70 p-3 rounded-xl border border-emerald-100">
              📝 <strong>Context & Suitability:</strong> {previewTopic.suitabilityNotes}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleAcceptAndGeneratePack(previewTopic)}
              disabled={isGeneratingPack}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {isGeneratingPack ? 'Creating Full 14-Section Pack...' : 'Accept Topic & Build Debate Pack'}
              </span>
            </button>

            <button
              onClick={() => {
                acceptTopic(previewTopic.id);
                setPreviewTopic(null);
              }}
              className="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              <span>Accept as Draft</span>
            </button>

            <button
              onClick={() => {
                rejectTopic(previewTopic.id);
                setPreviewTopic(null);
                handleGenerate();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-red-700 px-3 py-2 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reject & Try Another</span>
            </button>
          </div>
        </div>
      )}

      {/* Nigerian Curriculum Bank Browser */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Curated Nigerian Syllabus Bank for {activeLearner.classLevel}
            </h3>
            <p className="text-xs text-gray-700">
              Pick a verified curriculum motion instantly or use it as inspiration
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
            {curricularIdeas.length} motions available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {curricularIdeas.map((idea) => {
            const isAlreadyDebated = pastMotions.includes(idea.motion);
            return (
              <div
                key={idea.id}
                className="p-5 rounded-2xl border border-gray-200 hover:border-emerald-300 transition bg-slate-50/50 hover:bg-emerald-50/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {idea.category}
                    </span>
                    <span className="text-gray-700 font-medium">{idea.difficulty}</span>
                  </div>

                  <h5 className="font-bold text-sm text-gray-900 mb-1">{idea.title}</h5>
                  <p className="text-xs text-gray-800 italic bg-white p-2.5 rounded-xl border border-gray-100 mb-2">
                    "{idea.motion}"
                  </p>

                  <p className="text-[11px] text-gray-700">
                    🇳🇬 <strong>Context:</strong> {idea.nigerianContextNote}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  {isAlreadyDebated ? (
                    <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                      ✓ Already in History
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-medium">Ready to use</span>
                  )}

                  <button
                    onClick={async () => {
                      const newTopic: DebateTopic = {
                        id: `topic-${activeLearner.id}-${Date.now()}`,
                        learnerId: activeLearner.id,
                        learnerName: activeLearner.name,
                        learnerClass: activeLearner.classLevel,
                        title: idea.title,
                        motion: idea.motion,
                        category: idea.category,
                        difficulty: idea.difficulty,
                        weekNumber: targetWeek,
                        scheduledDate: new Date().toISOString().split('T')[0],
                        approvalStatus: 'Accepted',
                        completionStatus: 'Draft',
                        suitabilityNotes: idea.pedagogicalRationale,
                        createdAt: new Date().toISOString()
                      };
                      await handleAcceptAndGeneratePack(newTopic);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition cursor-pointer shadow-2xs"
                  >
                    <span>Use this Motion</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
