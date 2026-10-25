/**
 * Parent's Debate Guide & 12-Category Curriculum Syllabus
 * Complete handbook for coaching children at home with the P-R-E-L framework and 5 learning stages
 */

import React, { useState } from 'react';
import { TOPIC_CATEGORIES, LEARNING_STAGES } from '../types/debate';
import {
  BookMarked,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Lightbulb,
  Sparkles,
  Award,
  Printer,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';

export const ParentGuide: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(TOPIC_CATEGORIES[0]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Educational Curriculum & Coaching Guide
              </span>
              <span className="text-xs text-gray-700">Parent-Empowered</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Parent Coaching Handbook & Syllabus
            </h2>
            <p className="text-xs text-gray-700 mt-1 max-w-2xl">
              You do not need prior debating experience to coach your children. This guide provides
              everything you need: the 12-category syllabus, the 5 learning stages, and practical
              rules for building confidence and respect.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print Handbook</span>
          </button>
        </div>
      </div>

      {/* The P-R-E-L Formula Cheat Sheet */}
      <div className="bg-linear-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl mb-6">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-2">
            The Golden Formula
          </span>
          <h3 className="text-2xl font-extrabold tracking-tight mb-2">
            The P-R-E-L Debating Method
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Teach your child that a debate argument is not just shouting an opinion. A strong argument
            always follows four connected building blocks:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-sm">
              P
            </div>
            <h4 className="font-bold text-sm text-white">Point (Claim)</h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              State the idea clearly in one simple sentence. "What are you arguing?"
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-sm">
              R
            </div>
            <h4 className="font-bold text-sm text-white">Reason (Why)</h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Explain why your point is true and why it matters. Connect with "because..."
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-sm">
              E
            </div>
            <h4 className="font-bold text-sm text-white">Example / Evidence</h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Give a real-life Nigerian everyday situation, fact, or story that proves your reason.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-sm">
              L
            </div>
            <h4 className="font-bold text-sm text-white">Link to Motion</h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Finish by tying the example straight back to the motion: "Therefore, we conclude that..."
            </p>
          </div>
        </div>
      </div>

      {/* The 5 Progressive Learning Stages */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
        <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-600" />
          <span>The 5 Progressive Developmental Stages</span>
        </h3>
        <p className="text-xs text-gray-700">
          Children progress through five natural phases of public speaking and reasoning. Do not rush them; each stage builds the foundation for the next.
        </p>

        <div className="space-y-3">
          {LEARNING_STAGES.map((stg) => (
            <div
              key={stg.stage}
              className="p-4 rounded-xl border border-gray-200 bg-slate-50/70 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {stg.stage}
                  </span>
                  <h4 className="font-bold text-sm text-gray-900">{stg.name}</h4>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed pl-8">
                  {stg.description}
                </p>
              </div>

              <div className="sm:text-right pl-8 sm:pl-0 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Focus: {stg.focus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The 12-Category Nigerian Curriculum Syllabus */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              The 12-Category Curriculum Framework
            </h3>
            <p className="text-xs text-gray-700">
              Covers a full academic year of weekly debates spanning character, civic institutions, environment, and technology.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {TOPIC_CATEGORIES.map((cat, index) => {
            const isExpanded = expandedCategory === cat;
            return (
              <div
                key={cat}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white transition shadow-2xs"
              >
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-gray-900">{cat}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-gray-700 space-y-3 bg-slate-50/50 border-t border-gray-100">
                    <p className="leading-relaxed">
                      Explores how young citizens navigate ethical choices, community life, and national responsibilities in contemporary Nigeria.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <span className="font-bold text-emerald-800 block mb-1">
                          Primary 4 Focus (8 yrs):
                        </span>
                        <p className="text-gray-700">
                          Concrete everyday family, playground, and classroom situations with simple, tangible reasons.
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <span className="font-bold text-blue-800 block mb-1">
                          JSS 1 Focus (10 yrs):
                        </span>
                        <p className="text-gray-700">
                          Institutional governance, democratic checks, ethical dilemmas, and consequences for Nigerian society.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety & Child Appropriateness Principles */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h4 className="font-bold text-sm text-emerald-950 uppercase tracking-wider">
            Child Safeguards & Educational Integrity Principles
          </h4>
        </div>
        <ul className="text-xs text-emerald-900 space-y-1.5 leading-relaxed">
          <li>• <strong>No partisan politics:</strong> Civic governance is examined through public institutions and citizenship, never party campaigns.</li>
          <li>• <strong>Respect for diversity:</strong> Religious, cultural, and ethnic groups are treated with dignity; stereotyping is strictly forbidden.</li>
          <li>• <strong>Address ideas, not people:</strong> Rebuttals focus on flaws in reasoning rather than personal attacks or humiliation.</li>
          <li>• <strong>Honest research labeling:</strong> Sources are categorized as verified or general knowledge so children learn information integrity.</li>
        </ul>
      </div>
    </div>
  );
};
