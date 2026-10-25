/**
 * Module B: Learner Profiles Management
 * Edit age, class, learning stages, target speaking durations, confidence levels, and review individual debate stats
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Learner, LEARNING_STAGES } from '../types/debate';
import {
  Users,
  Award,
  BookOpen,
  Edit2,
  Save,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  Shield,
  Target
} from 'lucide-react';

export const LearnerProfiles: React.FC = () => {
  const { data, updateLearner, setActiveTab, setSelectedLearnerId } = useApp();

  const [editingLearnerId, setEditingLearnerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Learner>>({});

  const startEditing = (learner: Learner) => {
    setEditingLearnerId(learner.id);
    setFormData({
      name: learner.name,
      age: learner.age,
      classLevel: learner.classLevel,
      currentStage: learner.currentStage,
      confidenceLevel: learner.confidenceLevel,
      speakingSkillLevel: learner.speakingSkillLevel,
      preferredDuration: learner.preferredDuration,
      preferredVocabulary: learner.preferredVocabulary,
      areasForImprovement: learner.areasForImprovement,
      targetGoal: learner.targetGoal
    });
  };

  const handleSave = async (id: string) => {
    await updateLearner(id, formData);
    setEditingLearnerId(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Learner Profile Management
          </span>
          <span className="text-xs text-gray-700">Privacy Safeguarded</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Learner Profiles & Differentiated Settings
        </h2>
        <p className="text-xs text-gray-700 mt-1 max-w-2xl">
          Control reading difficulty, sentence length, vocabulary complexity, argument depth, speech length,
          and coaching expectations for each child. No unnecessary personal data is ever collected.
        </p>
      </div>

      {/* Two Profiles Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.learners.map((learner) => {
          const isJSS = learner.classLevel.includes('JSS');
          const isEditing = editingLearnerId === learner.id;

          const learnerTopics = data.topics.filter((t) => t.learnerId === learner.id);
          const completedTopics = learnerTopics.filter((t) => t.completionStatus === 'Completed');
          const learnerAssessments = data.assessments.filter((a) => a.learnerId === learner.id);

          const currentStageInfo =
            LEARNING_STAGES.find((s) => s.stage === learner.currentStage) || LEARNING_STAGES[0];

          return (
            <div
              key={learner.id}
              className={`bg-white rounded-2xl border transition shadow-xs overflow-hidden flex flex-col justify-between ${
                isJSS ? 'border-blue-200' : 'border-emerald-200'
              }`}
            >
              {/* Profile Card Header */}
              <div
                className={`p-6 border-b flex items-start justify-between gap-4 ${
                  isJSS
                    ? 'bg-linear-to-r from-blue-50 to-indigo-50/50 border-blue-100'
                    : 'bg-linear-to-r from-emerald-50 to-teal-50/50 border-emerald-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xl text-white shadow-sm ${
                      isJSS ? 'bg-blue-600' : 'bg-emerald-600'
                    }`}
                  >
                    {learner.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900 leading-tight">
                      {learner.name}
                    </h3>
                    <p className="text-xs text-gray-700">
                      {learner.classLevel} • {learner.age} years old
                    </p>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => startEditing(learner)}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSave(learner.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {/* Profile Fields */}
              <div className="p-6 space-y-5 flex-1">
                {isEditing ? (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-gray-900 block mb-1">Display Name</label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full p-2 rounded-lg border border-gray-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-900 block mb-1">Age</label>
                        <input
                          type="number"
                          value={formData.age || 8}
                          onChange={(e) =>
                            setFormData({ ...formData, age: parseInt(e.target.value, 10) })
                          }
                          className="w-full p-2 rounded-lg border border-gray-200 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-gray-900 block mb-1">Class Level</label>
                        <input
                          type="text"
                          value={formData.classLevel || ''}
                          onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                          className="w-full p-2 rounded-lg border border-gray-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-gray-900 block mb-1">
                          Current Stage (1–5)
                        </label>
                        <select
                          value={formData.currentStage || 1}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currentStage: parseInt(e.target.value, 10)
                            })
                          }
                          className="w-full p-2 rounded-lg border border-gray-200 bg-white"
                        >
                          {LEARNING_STAGES.map((s) => (
                            <option key={s.stage} value={s.stage}>
                              Stage {s.stage}: {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-gray-900 block mb-1">
                          Confidence Level
                        </label>
                        <select
                          value={formData.confidenceLevel || 'Developing'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confidenceLevel: e.target.value as any
                            })
                          }
                          className="w-full p-2 rounded-lg border border-gray-200 bg-white"
                        >
                          <option value="Beginning">Beginning</option>
                          <option value="Developing">Developing</option>
                          <option value="Good progress">Good progress</option>
                          <option value="High confidence">High confidence</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-gray-900 block mb-1">
                          Target Speaking Duration
                        </label>
                        <input
                          type="text"
                          value={formData.preferredDuration || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, preferredDuration: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border border-gray-200 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-900 block mb-1">
                        Preferred Vocabulary Level
                      </label>
                      <input
                        type="text"
                        value={formData.preferredVocabulary || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, preferredVocabulary: e.target.value })
                        }
                        className="w-full p-2 rounded-lg border border-gray-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-900 block mb-1">
                        Areas Requiring Improvement
                      </label>
                      <textarea
                        value={formData.areasForImprovement || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, areasForImprovement: e.target.value })
                        }
                        className="w-full h-16 p-2 rounded-lg border border-gray-200 bg-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-900 block mb-1">Target Goal</label>
                      <input
                        type="text"
                        value={formData.targetGoal || ''}
                        onChange={(e) => setFormData({ ...formData, targetGoal: e.target.value })}
                        className="w-full p-2 rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    {/* Stage Card */}
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-emerald-800">
                          Stage {learner.currentStage}: {currentStageInfo.name}
                        </span>
                        <span className="text-[10px] text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200 font-semibold">
                          Confidence: {learner.confidenceLevel}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-snug">{currentStageInfo.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-0.5">
                          Target Speech Length
                        </span>
                        <span className="font-bold text-gray-900 text-xs">
                          {learner.preferredDuration}
                        </span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-0.5">
                          Sessions Debated
                        </span>
                        <span className="font-bold text-gray-900 text-xs">
                          {learnerTopics.length} topics ({completedTopics.length} completed)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                        Vocabulary Target:
                      </span>
                      <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        {learner.preferredVocabulary}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                        Improvement Target:
                      </span>
                      <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        {learner.areasForImprovement}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Current Target Goal:
                      </span>
                      <div className="text-emerald-950 font-semibold bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{learner.targetGoal}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <span className="text-xs text-gray-700">
                  {learnerAssessments.length} formal assessments completed
                </span>
                <button
                  onClick={() => {
                    setSelectedLearnerId(learner.id);
                    setActiveTab('weekly-debates');
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  View Active Debates →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
