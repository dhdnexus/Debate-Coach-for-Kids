/**
 * Print View: Dedicated printable booklet layout for complete debate packs
 * Appears exclusively during window.print() via @media print styles
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { DebatePack } from '../types/debate';

export const PrintView: React.FC = () => {
  const { data, selectedPackId } = useApp();

  const pack: DebatePack | undefined = selectedPackId
    ? data.packs[selectedPackId]
    : Object.values(data.packs)[0];

  if (!pack) return null;

  return (
    <div className="print-only p-8 text-black bg-white max-w-4xl mx-auto space-y-8 font-serif leading-relaxed text-sm">
      {/* Title & Metadata Header */}
      <div className="border-b-2 border-black pb-4 text-center space-y-2">
        <div className="text-xs uppercase tracking-widest font-sans font-bold text-gray-700">
          Debate Coach for Kids • Weekly Preparation Pack
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{pack.title}</h1>
        <div className="text-base italic font-semibold p-3 bg-gray-100 border border-gray-300 rounded">
          "{pack.motion}"
        </div>
        <div className="flex justify-center gap-6 text-xs font-sans text-gray-800 pt-1">
          <span>Learner: <strong>{pack.learnerName}</strong></span>
          <span>Class: <strong>{pack.learnerClass}</strong> ({pack.learnerAge} yrs)</span>
          <span>Category: <strong>{pack.category}</strong></span>
          <span>Week: <strong>{pack.weekNumber}</strong></span>
          <span>Target Speech: <strong>{pack.recommendedSpeakingMinutes}</strong></span>
        </div>
      </div>

      {/* Section 1: Learning Objectives & Meaning */}
      <div className="space-y-3">
        <h2 className="text-base font-bold font-sans uppercase tracking-wider border-b border-gray-300 pb-1">
          1. Understanding the Motion & Key Vocabulary
        </h2>
        <p className="text-xs">
          <strong>Plain Meaning:</strong> {pack.understandingTheTopic.simpleMeaning}
        </p>
        <p className="text-xs">
          <strong>Real-World Issue:</strong> {pack.understandingTheTopic.realWorldIssue}
        </p>
        <p className="text-xs">
          <strong>Nigerian Context:</strong> {pack.understandingTheTopic.familiarNigerianExample}
        </p>

        <div className="text-xs space-y-1 pt-2">
          <strong>Glossary:</strong>
          {pack.understandingTheTopic.keyVocabulary.map((v, i) => (
            <div key={i} className="pl-3">
              • <strong>{v.word}:</strong> {v.definition} (<em>e.g. {v.childFriendlyExample}</em>)
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Proposition Arguments */}
      <div className="space-y-4 page-break-before">
        <h2 className="text-base font-bold font-sans uppercase tracking-wider border-b border-gray-300 pb-1 text-emerald-950">
          2. Arguments FOR the Motion (Proposition)
        </h2>
        <div className="space-y-4">
          {pack.propositionArguments.map((arg, i) => (
            <div key={i} className="border border-gray-300 p-3 rounded text-xs space-y-1">
              <div className="font-bold text-sm font-sans">
                Point {i + 1}: {arg.title}
              </div>
              <div><strong>Claim (P):</strong> {arg.claim}</div>
              <div><strong>Reason (R):</strong> {arg.reason}</div>
              <div><strong>Nigerian Example (E):</strong> {arg.example}</div>
              <div><strong>Link (L):</strong> {arg.linkToMotion}</div>
              <div className="italic pt-1 text-gray-800">
                <strong>Speech Sentence:</strong> "{arg.speechSentence}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Opposition Arguments */}
      <div className="space-y-4 page-break-before">
        <h2 className="text-base font-bold font-sans uppercase tracking-wider border-b border-gray-300 pb-1 text-amber-950">
          3. Arguments AGAINST the Motion (Opposition)
        </h2>
        <div className="space-y-4">
          {pack.oppositionArguments.map((arg, i) => (
            <div key={i} className="border border-gray-300 p-3 rounded text-xs space-y-1">
              <div className="font-bold text-sm font-sans">
                Counter-Point {i + 1}: {arg.title}
              </div>
              <div><strong>Claim (P):</strong> {arg.claim}</div>
              <div><strong>Reason (R):</strong> {arg.reason}</div>
              <div><strong>Nigerian Example (E):</strong> {arg.example}</div>
              <div><strong>Link (L):</strong> {arg.linkToMotion}</div>
              <div className="italic pt-1 text-gray-800">
                <strong>Speech Sentence:</strong> "{arg.speechSentence}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Sample Speeches */}
      <div className="space-y-4 page-break-before">
        <h2 className="text-base font-bold font-sans uppercase tracking-wider border-b border-gray-300 pb-1">
          4. Complete Model Speeches
        </h2>

        <div className="space-y-2">
          <h3 className="font-bold text-sm font-sans">A. Full Proposition Speech</h3>
          <div className="text-xs whitespace-pre-line bg-gray-50 p-4 border border-gray-300 rounded leading-relaxed">
            {pack.sampleSpeeches.propositionSpeech}
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <h3 className="font-bold text-sm font-sans">B. Full Opposition Speech</h3>
          <div className="text-xs whitespace-pre-line bg-gray-50 p-4 border border-gray-300 rounded leading-relaxed">
            {pack.sampleSpeeches.oppositionSpeech}
          </div>
        </div>
      </div>

      {/* Section 5: Rebuttal Bank */}
      <div className="space-y-3 page-break-before">
        <h2 className="text-base font-bold font-sans uppercase tracking-wider border-b border-gray-300 pb-1">
          5. Rebuttal Bank (Respectful Responses)
        </h2>
        <div className="space-y-3 text-xs">
          {pack.rebuttals.map((r, i) => (
            <div key={i} className="border border-gray-300 p-3 rounded space-y-1">
              <div><strong>Opposing Claim:</strong> "{r.opposingClaim}"</div>
              <div><strong>Response:</strong> {r.respectfulResponse}</div>
              <div className="italic"><strong>Say aloud:</strong> "{r.speechReadyRebuttal}"</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6: Independent Thinking Fill-in Worksheet */}
      <div className="space-y-4 page-break-before">
        <h2 className="text-base font-bold font-sans uppercase tracking-wider border-b border-gray-300 pb-1">
          6. Learner's Fill-in Debate Speech Worksheet
        </h2>
        <div className="border-2 border-black p-4 rounded space-y-4 text-xs">
          <div>My opinion is ____________________________________________________________________</div>
          <div>I believe this because ______________________________________________________________</div>
          <div>One Nigerian example is ___________________________________________________________</div>
          <div>Someone may disagree because ______________________________________________________</div>
          <div>My respectful response is __________________________________________________________</div>
          <div>Therefore, I conclude that __________________________________________________________</div>
        </div>
      </div>

      {/* Section 7: Parent Coaching Guide & Schedule */}
      <div className="space-y-3 page-break-before">
        <h2 className="text-base font-bold font-sans uppercase tracking-wider border-b border-gray-300 pb-1">
          7. Parent's Coaching Guide & 5-Day Schedule
        </h2>
        <div className="grid grid-cols-5 gap-2 text-[11px] font-sans">
          {pack.parentCoachingGuide.dayByDayPlan.map((d, i) => (
            <div key={i} className="border border-gray-300 p-2 rounded">
              <strong className="block">{d.day}</strong>
              <div className="font-semibold text-gray-700">{d.title}</div>
              <div className="text-[10px] text-gray-600">{d.focus}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 8: Assessment Rubric */}
      <div className="space-y-3 page-break-before">
        <h2 className="text-base font-bold font-sans uppercase tracking-wider border-b border-gray-300 pb-1">
          8. Weekly Assessment Rubric (1 = Beginning to 4 = Strong)
        </h2>
        <table className="w-full text-[10px] border-collapse border border-gray-300 font-sans">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1.5 text-left">Criterion</th>
              <th className="border border-gray-300 p-1.5 text-left">Description</th>
              <th className="border border-gray-300 p-1.5 text-center w-12">Score (1-4)</th>
            </tr>
          </thead>
          <tbody>
            {pack.assessmentRubricTemplate.criteria.map((c) => (
              <tr key={c.id}>
                <td className="border border-gray-300 p-1.5 font-bold">{c.name}</td>
                <td className="border border-gray-300 p-1.5">{c.description}</td>
                <td className="border border-gray-300 p-1.5 text-center font-bold">___</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
          <div className="border border-gray-300 p-3 rounded h-20">
            <strong>What was done well:</strong>
          </div>
          <div className="border border-gray-300 p-3 rounded h-20">
            <strong>One improvement target:</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
