/**
 * Module D: Comprehensive Debate Pack Viewer & Workbench
 * Renders all 14 structured educational sections with tabbed navigation, inline editing, and live practice mode
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DebatePack,
  DebateArgument,
  RebuttalItem,
  ResearchSource,
  SessionAssessment
} from '../types/debate';
import { InteractivePracticeMode } from './InteractivePracticeMode';
import {
  BookOpen,
  Award,
  Clock,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Volume2,
  Users,
  Compass,
  Lightbulb,
  Check,
  RotateCw,
  Edit3,
  Save,
  X,
  Play,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const DebatePackViewer: React.FC = () => {
  const {
    data,
    selectedPackId,
    selectedTopicId,
    updatePack,
    recordAssessment,
    generatePackForTopic,
    isGeneratingPack,
    setActiveTab
  } = useApp();

  // Find active pack
  const pack: DebatePack | undefined = selectedPackId
    ? data.packs[selectedPackId]
    : Object.values(data.packs)[0];

  const topic = data.topics.find((t) => t.id === pack?.topicId || t.id === selectedTopicId);
  const learner = data.learners.find((l) => l.id === pack?.learnerId);

  // Active sub-tab
  const [activeSection, setActiveSection] = useState<
    | 'overview'
    | 'arguments-for'
    | 'arguments-against'
    | 'sample-speeches'
    | 'rebuttals'
    | 'evidence'
    | 'practice-worksheet'
    | 'coaching-guide'
    | 'confidence'
    | 'rubric'
    | 'practice-mode'
  >('overview');

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedPack, setEditedPack] = useState<DebatePack | null>(null);

  // Rubric assessment form state
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({
    clarity: 3,
    confidence: 3,
    reasoning: 3,
    evidence: 3,
    organization: 3,
    listening_rebuttal: 3,
    respectful_comm: 4,
    independence: 3
  });
  const [whatChildDidWell, setWhatChildDidWell] = useState('');
  const [oneImprovementTarget, setOneImprovementTarget] = useState('');
  const [parentComments, setParentComments] = useState('');
  const [childReflection, setChildReflection] = useState('');
  const [nextPracticeGoal, setNextPracticeGoal] = useState('');
  const [isAssessmentSaved, setIsAssessmentSaved] = useState(false);

  // Independent thinking fill-in state
  const [worksheetAnswers, setWorksheetAnswers] = useState({
    opinion: '',
    reason: '',
    example: '',
    opposingView: '',
    response: '',
    conclusion: '',
    originalNigerianExample: ''
  });

  if (!pack) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-xl mx-auto shadow-xs">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Debate Pack Selected</h3>
        <p className="text-xs text-gray-700 mb-6">
          Select or generate a debate topic from the dashboard to explore the 14-section preparation pack.
        </p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const isJSS = pack.learnerClass.includes('JSS');
  const isP4 = pack.learnerClass.includes('4') || pack.learnerAge <= 8;

  const handleStartEdit = () => {
    setEditedPack(JSON.parse(JSON.stringify(pack)));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editedPack) {
      await updatePack(pack.id, editedPack);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPack(null);
  };

  const handleDifficultyAdjustment = async (direction: 'easier' | 'harder') => {
    if (topic) {
      await generatePackForTopic(topic.id, direction);
    }
  };

  const handleScoreChange = (criterionId: string, score: number) => {
    setRubricScores((prev) => ({ ...prev, [criterionId]: score }));
  };

  const handleSaveAssessment = async () => {
    const totalScore = Object.values(rubricScores).reduce((a, b) => a + b, 0);
    const maxScore = Object.keys(rubricScores).length * 4;

    const assessment: SessionAssessment = {
      id: `assessment-${Date.now()}`,
      learnerId: pack.learnerId,
      learnerName: pack.learnerName,
      topicId: pack.topicId,
      packId: pack.id,
      topicTitle: pack.title,
      motion: pack.motion,
      date: new Date().toISOString().split('T')[0],
      scores: rubricScores,
      totalScore,
      maxScore,
      whatChildDidWell: whatChildDidWell || 'Delivered arguments with poise and clear voice.',
      oneImprovementTarget: oneImprovementTarget || 'Expand reasons before giving examples.',
      parentComments: parentComments || 'Great home practice session!',
      childReflection: childReflection || 'I felt proud of my speech!',
      nextPracticeGoal: nextPracticeGoal || 'Stand up without fidgeting.',
      createdAt: new Date().toISOString()
    };

    await recordAssessment(assessment);
    setIsAssessmentSaved(true);
    setTimeout(() => setIsAssessmentSaved(false), 3000);
  };

  const currentDisplayPack = isEditing && editedPack ? editedPack : pack;

  // Render P-R-E-L Argument Card
  const renderArgumentCard = (arg: DebateArgument, index: number, side: 'prop' | 'opp') => {
    const isProp = side === 'prop';
    return (
      <div
        key={arg.id || index}
        className={`bg-white rounded-2xl border p-5 transition shadow-2xs space-y-3 ${
          isProp
            ? 'border-emerald-200/90 hover:border-emerald-300'
            : 'border-amber-200/90 hover:border-amber-300'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                isProp ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
            >
              {index + 1}
            </span>
            <h5 className="font-bold text-sm text-gray-900">{arg.title}</h5>
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              isProp ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
            }`}
          >
            {isProp ? 'Proposition' : 'Opposition'}
          </span>
        </div>

        {/* P-R-E-L breakdown */}
        <div className="space-y-2 text-xs">
          <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-900 block mb-0.5">📌 Point (Claim):</span>
            <p className="text-gray-800">{arg.claim}</p>
          </div>

          <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-900 block mb-0.5">💡 Reason (Why it matters):</span>
            <p className="text-gray-800">{arg.reason}</p>
          </div>

          <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
            <span className="font-bold text-emerald-950 block mb-0.5">🇳🇬 Nigerian Example / Evidence:</span>
            <p className="text-emerald-950 font-medium">{arg.example}</p>
          </div>

          <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-900 block mb-0.5">🔗 Link to Motion:</span>
            <p className="text-gray-800">{arg.linkToMotion}</p>
          </div>
        </div>

        {/* Speech-Ready Sentence */}
        <div
          className={`p-3 rounded-xl border text-xs font-medium ${
            isProp
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
            🗣️ Speech-Ready Sentence for {pack.learnerName}:
          </span>
          <p className="italic">"{arg.speechSentence}"</p>
        </div>

        {/* Critical Weakness / Counter-Angle */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-gray-700">
          <span className="font-bold text-gray-800 block mb-0.5">
            🔍 Critical Thinking Limitation:
          </span>
          <p>{arg.weakness}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Pack Header Card */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isJSS ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {pack.learnerName} • {pack.learnerClass} ({pack.learnerAge} yrs)
              </span>
              <span className="text-xs text-gray-700 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
                Week {pack.weekNumber}
              </span>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {pack.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {pack.contentSuitabilityStatus}
              </span>
              <span className="text-[11px] text-gray-700">v{pack.version}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-snug">
              {pack.title}
            </h2>

            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/70 text-sm font-semibold text-emerald-950 italic">
              "{pack.motion}"
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                ⏱️ Speech: <strong className="text-gray-900">{pack.recommendedSpeakingMinutes}</strong>
              </span>
              <span className="text-xs text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                📚 Prep: <strong className="text-gray-900">{pack.estimatedPrepTimeMinutes} mins</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSection('practice-mode')}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Practice Mode</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Print Full Preparation Booklet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              {!isEditing ? (
                <button
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Edit debate pack contents"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Difficulty Controls */}
            <div className="flex items-center gap-1 text-[11px] text-gray-700">
              <span>Adjust motion:</span>
              <button
                onClick={() => handleDifficultyAdjustment('easier')}
                disabled={isGeneratingPack}
                className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium cursor-pointer disabled:opacity-50"
              >
                Simpler
              </button>
              <button
                onClick={() => handleDifficultyAdjustment('harder')}
                disabled={isGeneratingPack}
                className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium cursor-pointer disabled:opacity-50"
              >
                More Nuanced
              </button>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-gray-100 scrollbar-none">
          {[
            { id: 'overview', label: '1. Overview & Understanding' },
            { id: 'arguments-for', label: `2. Proposition (${pack.propositionArguments.length} Points)` },
            { id: 'arguments-against', label: `3. Opposition (${pack.oppositionArguments.length} Points)` },
            { id: 'sample-speeches', label: '4. Model Speeches' },
            { id: 'rebuttals', label: '5. Rebuttal Bank' },
            { id: 'evidence', label: '6. Evidence & Sources' },
            { id: 'practice-worksheet', label: '7. Fill-in Worksheet' },
            { id: 'coaching-guide', label: '8. Parent Coaching Plan' },
            { id: 'confidence', label: '9. Warm-up & Habits' },
            { id: 'rubric', label: '10. Weekly Rubric' },
            { id: 'practice-mode', label: '🎙️ Live Practice Timer' }
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Section Content */}
      <div className="space-y-6">
        {/* TAB: LIVE PRACTICE MODE */}
        {activeSection === 'practice-mode' && (
          <InteractivePracticeMode
            pack={pack}
            onFinishPractice={() => {
              setActiveSection('rubric');
            }}
          />
        )}

        {/* TAB 1: OVERVIEW & UNDERSTANDING */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Learning Objectives */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Learning Objectives for this Session</span>
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {currentDisplayPack.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Simple Meaning & Real-World Issue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Understanding the Motion</span>
                </h4>
                <div>
                  <span className="text-xs font-bold text-gray-900 block mb-1">
                    Plain-Language Explanation:
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    {currentDisplayPack.understandingTheTopic.simpleMeaning}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block mb-1">
                    The Real-World Issue:
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {currentDisplayPack.understandingTheTopic.realWorldIssue}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 block mb-1">Why It Matters:</span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {currentDisplayPack.understandingTheTopic.whyItMatters}
                  </p>
                </div>
              </div>

              {/* Nigerian Real-Life Example & Reflection Questions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span>🇳🇬 Nigerian Everyday Context</span>
                </h4>
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium leading-relaxed">
                  {currentDisplayPack.understandingTheTopic.familiarNigerianExample}
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-900 block mb-2">
                    Questions to Help {pack.learnerName} Think Independently:
                  </span>
                  <div className="space-y-2">
                    {currentDisplayPack.understandingTheTopic.reflectionQuestions.map((q, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-800 flex items-start gap-2"
                      >
                        <span className="font-bold text-emerald-700 shrink-0">Q{i + 1}:</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Vocabulary Bank */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Vocabulary Mastery (Child-Friendly Definitions & Examples)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentDisplayPack.understandingTheTopic.keyVocabulary.map((vocab, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-gray-100 bg-slate-50/80 hover:bg-emerald-50/40 transition"
                  >
                    <span className="font-extrabold text-emerald-800 text-sm block mb-1">
                      {vocab.word}
                    </span>
                    <p className="text-xs text-gray-700 mb-2 leading-relaxed">{vocab.definition}</p>
                    <div className="text-[11px] text-emerald-900 bg-white p-2 rounded-lg border border-gray-100 italic">
                      "e.g. {vocab.childFriendlyExample}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Background & Context: Facts vs Opinions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Background Context & Civic Connection
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                {currentDisplayPack.backgroundAndContext.contextSummary}
              </p>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-950 font-medium">
                🏛️ <strong>Civic Connection:</strong>{' '}
                {currentDisplayPack.backgroundAndContext.civicConnection}
              </div>

              <div>
                <span className="text-xs font-bold text-gray-900 block mb-2">
                  Distinguishing Facts from Opinions & Interpretations:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentDisplayPack.backgroundAndContext.distinguishingFactsFromOpinions.map(
                    (item, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-800"
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARGUMENTS FOR (PROPOSITION) */}
        {activeSection === 'arguments-for' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Proposition Case ({currentDisplayPack.propositionArguments.length} Structured Arguments)
                </h4>
                <p className="text-xs text-emerald-900">
                  Every argument uses the <strong>Point → Reason → Example → Link (P-R-E-L)</strong> formula.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200">
                Supporting the Motion
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentDisplayPack.propositionArguments.map((arg, i) =>
                renderArgumentCard(arg, i, 'prop')
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ARGUMENTS AGAINST (OPPOSITION) */}
        {activeSection === 'arguments-against' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-amber-950 text-sm">
                  Opposition Case ({currentDisplayPack.oppositionArguments.length} Defensible Counter-Arguments)
                </h4>
                <p className="text-xs text-amber-900">
                  Teaching children that reasonable people can genuinely disagree with thoughtful reasons.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-white px-3 py-1 rounded-full border border-amber-200">
                Opposing the Motion
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentDisplayPack.oppositionArguments.map((arg, i) =>
                renderArgumentCard(arg, i, 'opp')
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MODEL SPEECHES */}
        {activeSection === 'sample-speeches' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Proposition Speech */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Model Speech
                    </span>
                    <h4 className="font-bold text-base text-gray-900">
                      Proposition (Supporting the Motion)
                    </h4>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md font-semibold border border-emerald-100">
                    {pack.recommendedSpeakingMinutes}
                  </span>
                </div>

                <div className="prose prose-sm text-xs text-gray-800 whitespace-pre-line leading-relaxed space-y-3 font-serif">
                  {currentDisplayPack.sampleSpeeches.propositionSpeech}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                  Key Rhetorical Milestones:
                </span>
                <ul className="text-xs text-gray-700 space-y-1">
                  {currentDisplayPack.sampleSpeeches.propositionKeyPoints.map((pt, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Opposition Speech */}
            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                      Model Speech
                    </span>
                    <h4 className="font-bold text-base text-gray-900">
                      Opposition (Opposing the Motion)
                    </h4>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-900 px-2.5 py-1 rounded-md font-semibold border border-amber-100">
                    {pack.recommendedSpeakingMinutes}
                  </span>
                </div>

                <div className="prose prose-sm text-xs text-gray-800 whitespace-pre-line leading-relaxed space-y-3 font-serif">
                  {currentDisplayPack.sampleSpeeches.oppositionSpeech}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block mb-1">
                  Key Rhetorical Milestones:
                </span>
                <ul className="text-xs text-gray-700 space-y-1">
                  {currentDisplayPack.sampleSpeeches.oppositionKeyPoints.map((pt, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REBUTTALS */}
        {activeSection === 'rebuttals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h4 className="font-bold text-base text-gray-900 mb-1">
                Rebuttal Bank: Anticipating Opposing Arguments
              </h4>
              <p className="text-xs text-gray-700 mb-6">
                Teaches children to listen intently, identify the opponent's main point, and respond
                respectfully to the idea rather than attacking the speaker.
              </p>

              <div className="space-y-4">
                {currentDisplayPack.rebuttals.map((reb, i) => (
                  <div
                    key={reb.id || i}
                    className="p-5 rounded-2xl border border-gray-200 bg-slate-50/70 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                          Opposing Claim #{i + 1}
                        </span>
                        <h5 className="font-bold text-sm text-gray-900">
                          "{reb.opposingClaim}"
                        </h5>
                      </div>
                      <span className="text-xs text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                        Why believed: {reb.whySomeoneMightBelieveIt}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <span className="font-bold text-gray-900 block mb-1">
                          🤝 Respectful Diplomatic Response:
                        </span>
                        <p className="text-gray-700">{reb.respectfulResponse}</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <span className="font-bold text-gray-900 block mb-1">
                          💡 Supporting Reason / Example:
                        </span>
                        <p className="text-gray-700">{reb.supportingReasonOrExample}</p>
                      </div>
                    </div>

                    {/* Speech ready rebuttal */}
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium">
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 text-emerald-800">
                        🗣️ Ready Rebuttal Sentence to say aloud:
                      </span>
                      <p className="italic">"{reb.speechReadyRebuttal}"</p>
                    </div>

                    <p className="text-[11px] text-gray-700 italic">
                      Coaching Note: {reb.guidanceNote}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: EVIDENCE & RESEARCH */}
        {activeSection === 'evidence' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-base text-gray-900">
                    Evidence, Statistics & Official Research
                  </h4>
                  <p className="text-xs text-gray-700">
                    Grounding arguments in real Nigerian educational and civic institutions
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-700 font-medium">Research Status:</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    ✓ {currentDisplayPack.evidenceAndResearch.researchStatus}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-700 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                {currentDisplayPack.evidenceAndResearch.researchNotes}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentDisplayPack.evidenceAndResearch.sources.map((src, i) => (
                  <div
                    key={src.id || i}
                    className="p-5 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-xs text-gray-900 leading-snug">
                        {src.title}
                      </h5>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0">
                        {src.verificationStatus}
                      </span>
                    </div>

                    <div className="text-xs text-gray-700">
                      <span className="font-bold text-gray-800">Organization:</span>{' '}
                      {src.organization}
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {src.summary}
                    </p>

                    <div className="text-[11px] text-emerald-900">
                      <strong>Relevance:</strong> {src.relevanceNote}
                    </div>

                    {src.url && (
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                        <span className="text-gray-700">Supports: {src.supportsSide}</span>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                        >
                          <span>{src.organization}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: INDEPENDENT THINKING FILL-IN WORKSHEET */}
        {activeSection === 'practice-worksheet' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-base text-gray-900">
                    Independent-Thinking Practice Worksheet
                  </h4>
                  <p className="text-xs text-gray-700">
                    Prevents memorisation of sample speeches and guides {pack.learnerName} to formulate original thoughts.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Worksheet</span>
                </button>
              </div>

              {/* Guided Fill-In Template */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 mb-6">
                <h5 className="font-bold text-sm text-gray-900">
                  Fill-in-the-Blanks Debate Speech Builder
                </h5>
                <p className="text-xs text-gray-700">
                  {pack.learnerName} can type their own thoughts below or write them in a notebook:
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-900 block mb-1">
                      1. My opinion is:
                    </label>
                    <input
                      type="text"
                      value={worksheetAnswers.opinion}
                      onChange={(e) =>
                        setWorksheetAnswers({ ...worksheetAnswers, opinion: e.target.value })
                      }
                      placeholder={
                        currentDisplayPack.independentThinkingExercises.fillInTemplate.opinion
                      }
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-900 block mb-1">
                      2. I believe this because:
                    </label>
                    <input
                      type="text"
                      value={worksheetAnswers.reason}
                      onChange={(e) =>
                        setWorksheetAnswers({ ...worksheetAnswers, reason: e.target.value })
                      }
                      placeholder={
                        currentDisplayPack.independentThinkingExercises.fillInTemplate.reason
                      }
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-900 block mb-1">
                      3. One Nigerian example is:
                    </label>
                    <input
                      type="text"
                      value={worksheetAnswers.example}
                      onChange={(e) =>
                        setWorksheetAnswers({ ...worksheetAnswers, example: e.target.value })
                      }
                      placeholder={
                        currentDisplayPack.independentThinkingExercises.fillInTemplate.example
                      }
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-900 block mb-1">
                      4. Someone may disagree because:
                    </label>
                    <input
                      type="text"
                      value={worksheetAnswers.opposingView}
                      onChange={(e) =>
                        setWorksheetAnswers({ ...worksheetAnswers, opposingView: e.target.value })
                      }
                      placeholder={
                        currentDisplayPack.independentThinkingExercises.fillInTemplate.opposingView
                      }
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-900 block mb-1">
                      5. My respectful response is:
                    </label>
                    <input
                      type="text"
                      value={worksheetAnswers.response}
                      onChange={(e) =>
                        setWorksheetAnswers({ ...worksheetAnswers, response: e.target.value })
                      }
                      placeholder={
                        currentDisplayPack.independentThinkingExercises.fillInTemplate.response
                      }
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-900 block mb-1">
                      6. Therefore, I conclude that:
                    </label>
                    <input
                      type="text"
                      value={worksheetAnswers.conclusion}
                      onChange={(e) =>
                        setWorksheetAnswers({ ...worksheetAnswers, conclusion: e.target.value })
                      }
                      placeholder={
                        currentDisplayPack.independentThinkingExercises.fillInTemplate.conclusion
                      }
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Thinking Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1">
                  <span className="font-bold text-xs text-gray-900 block">
                    ⭐ Strongest Argument Challenge:
                  </span>
                  <p className="text-xs text-gray-700">
                    {currentDisplayPack.independentThinkingExercises.strongestArgumentPrompt}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1">
                  <span className="font-bold text-xs text-gray-900 block">
                    🔍 Spotting the Weakness:
                  </span>
                  <p className="text-xs text-gray-700">
                    {currentDisplayPack.independentThinkingExercises.preferredSideWeaknessPrompt}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1">
                  <span className="font-bold text-xs text-gray-900 block">
                    🤝 Explaining the Other Side Fairly:
                  </span>
                  <p className="text-xs text-gray-700">
                    {currentDisplayPack.independentThinkingExercises.opposingViewFairExplanationPrompt}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1">
                  <span className="font-bold text-xs text-gray-900 block">
                    🇳🇬 Original Nigerian Story:
                  </span>
                  <p className="text-xs text-gray-700">
                    {currentDisplayPack.independentThinkingExercises.originalNigerianExamplePrompt}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: PARENT'S COACHING GUIDE */}
        {activeSection === 'coaching-guide' && (
          <div className="space-y-6">
            {/* 5-Day Preparation Schedule */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h4 className="font-bold text-base text-gray-900 mb-1">
                5-Day Parent Coaching Schedule (10–25 mins/day)
              </h4>
              <p className="text-xs text-gray-700 mb-6">
                Designed for busy parents with no formal debate training. Bite-sized, progressive, and stress-free.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {currentDisplayPack.parentCoachingGuide.dayByDayPlan.map((plan, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 transition space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-emerald-800">{plan.day}</span>
                      <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-gray-700 border border-emerald-200">
                        {plan.duration}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-gray-900">{plan.title}</h5>
                    <p className="text-[11px] text-gray-700 leading-tight">{plan.focus}</p>

                    <div className="pt-2 border-t border-emerald-200/50 space-y-1">
                      {plan.parentActions.map((act, j) => (
                        <div key={j} className="text-[10px] text-emerald-950 flex items-start gap-1">
                          <span>•</span>
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Essential vs Optional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
                <h5 className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Essential Sections (If You Only Have 20 Mins)</span>
                </h5>
                <ul className="text-xs text-gray-700 space-y-2">
                  {currentDisplayPack.parentCoachingGuide.essentialSections.map((sec, i) => (
                    <li key={i} className="flex items-center gap-2 bg-emerald-50/60 p-2.5 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
                <h5 className="font-bold text-sm text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Optional Advanced Material</span>
                </h5>
                <ul className="text-xs text-gray-700 space-y-2">
                  {currentDisplayPack.parentCoachingGuide.optionalAdvancedSections.map((sec, i) => (
                    <li key={i} className="flex items-center gap-2 bg-blue-50/60 p-2.5 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Coaching Tips: Unsticking & Gentle Corrections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
                <h5 className="font-bold text-sm text-gray-900">
                  How to Help When {pack.learnerName} Gets Stuck
                </h5>
                <div className="space-y-2 text-xs text-gray-700">
                  {currentDisplayPack.parentCoachingGuide.howToUnstickChild.map((tip, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      💡 {tip}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
                <h5 className="font-bold text-sm text-gray-900">
                  How to Correct Factual Mistakes Gently
                </h5>
                <div className="space-y-2 text-xs text-gray-700">
                  {currentDisplayPack.parentCoachingGuide.howToCorrectGently.map((tip, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      🌱 {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: CONFIDENCE-BUILDING & HABITS */}
        {activeSection === 'confidence' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Card */}
            <div className="bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Pre-Debate Warm-up Activity
                </span>
                <span className="text-xs font-semibold bg-white border border-amber-200 px-2.5 py-1 rounded-md text-amber-900">
                  ⏱️ {currentDisplayPack.confidenceBuildingActivity.durationMinutes} minutes
                </span>
              </div>

              <h4 className="text-xl font-extrabold text-amber-950">
                "{currentDisplayPack.confidenceBuildingActivity.activityName}"
              </h4>

              <p className="text-xs text-amber-900/90 leading-relaxed bg-white/70 p-4 rounded-xl border border-amber-200/60 font-medium">
                {currentDisplayPack.confidenceBuildingActivity.instructions}
              </p>

              <div className="p-3 bg-amber-100/60 rounded-xl text-xs text-amber-950">
                ⭐ <strong>Why this works:</strong> Laughing and speaking playfully lowers stage fright and warms up the vocal cords!
              </div>
            </div>

            {/* Speaking Habits Checklist */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Lifelong Speaking Habits Checklist</span>
              </h4>
              <p className="text-xs text-gray-700">
                Review these 5 simple habits with {pack.learnerName} before they stand up:
              </p>

              <div className="space-y-2.5">
                {currentDisplayPack.confidenceBuildingActivity.speakingHabitsChecklist.map((habit, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-gray-100 bg-slate-50 flex items-center gap-3 text-xs text-gray-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {i + 1}
                    </span>
                    <span>{habit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: ASSESSMENT RUBRIC */}
        {activeSection === 'rubric' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h4 className="font-bold text-base text-gray-900">
                  Weekly Assessment Rubric (1 to 4 Scale)
                </h4>
                <p className="text-xs text-gray-700">
                  1 = Beginning • 2 = Developing • 3 = Good Progress • 4 = Strong Performance for Level
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-700 block">Total Score</span>
                <span className="text-lg font-mono font-bold text-emerald-700">
                  {Object.values(rubricScores).reduce((a, b) => a + b, 0)} / 32
                </span>
              </div>
            </div>

            {/* Criteria Grid */}
            <div className="space-y-4">
              {currentDisplayPack.assessmentRubricTemplate.criteria.map((crit) => {
                const currentScore = rubricScores[crit.id] || 3;
                return (
                  <div
                    key={crit.id}
                    className="p-4 rounded-xl border border-gray-100 bg-slate-50/70 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-xs text-gray-900">{crit.name}</h5>
                        <p className="text-[11px] text-gray-700">{crit.description}</p>
                      </div>

                      {/* 1 to 4 selector */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleScoreChange(crit.id, num)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                              currentScore === num
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Level Description */}
                    <div className="text-[11px] text-emerald-950 bg-white p-2.5 rounded-lg border border-gray-100 italic">
                      Current: {crit[`level${currentScore}` as keyof typeof crit]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Qualitative Feedback Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
              <div>
                <label className="font-bold text-gray-900 block mb-1">
                  🌟 What {pack.learnerName} did well:
                </label>
                <textarea
                  value={whatChildDidWell}
                  onChange={(e) => setWhatChildDidWell(e.target.value)}
                  placeholder="e.g. Stood tall, used clear voice, gave a great Nigerian school example."
                  className="w-full h-20 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">
                  🎯 One improvement target for next week:
                </label>
                <textarea
                  value={oneImprovementTarget}
                  onChange={(e) => setOneImprovementTarget(e.target.value)}
                  placeholder="e.g. Pause for 2 seconds after each main point rather than rushing."
                  className="w-full h-20 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">
                  💭 Child's reflection (in their own words):
                </label>
                <textarea
                  value={childReflection}
                  onChange={(e) => setChildReflection(e.target.value)}
                  placeholder="e.g. 'I was nervous at first, but making mummy laugh with my speech was fun!'"
                  className="w-full h-20 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">
                  📝 Parent's coaching comments:
                </label>
                <textarea
                  value={parentComments}
                  onChange={(e) => setParentComments(e.target.value)}
                  placeholder="e.g. Wonderful progress compared to week 1. Much more relaxed."
                  className="w-full h-20 p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-700 italic">
                Scores will be saved to {pack.learnerName}'s long-term progress record.
              </span>
              <button
                onClick={handleSaveAssessment}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>{isAssessmentSaved ? 'Assessment Saved! ✓' : 'Save Session Assessment'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
