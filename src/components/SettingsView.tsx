/**
 * Settings, Data Persistence & Backup Management
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  HardDrive,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Key
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    data,
    systemHealth,
    exportDataJson,
    importDataJson,
    resetToDefaults
  } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate-coach-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async () => {
    if (!importJsonText.trim()) return;
    const ok = await importDataJson(importJsonText);
    if (ok) {
      setImportStatus('Backup restored successfully!');
      setImportJsonText('');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('Import failed. Invalid JSON structure.');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            System Configuration & Backups
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Settings, Storage & Privacy
        </h2>
        <p className="text-xs text-gray-700 mt-1 max-w-2xl">
          Manage your debate database, export offline JSON backups, verify AI connections, and ensure
          your children's practice materials are safely preserved.
        </p>
      </div>

      {/* Storage Architecture & Persistence Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-600" />
          <span>Persistence Architecture & Data Safety</span>
        </h3>

        <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dual-Layer Local File & Browser Persistence Active</span>
          </div>
          <p>
            Your debate records, generated packs, learner profiles, and rubric scores are saved to the
            server’s local JSON storage (<code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-900">data/debate_coach_data.json</code>) with atomic write protection, and synchronously mirrored in browser <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-900">localStorage</code>.
          </p>
          <div className="text-[11px] text-emerald-800 font-medium pt-1">
            ⚠️ <em>Important Transparency Note:</em> This is local storage on the running host, not a remote cloud database. To ensure you never lose valuable debate packs or rubric history across environment redeployments, please use the <strong>Download JSON Backup</strong> button below regularly.
          </div>
        </div>

        {/* Current Database Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs pt-2">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-700 block text-[11px]">Learners</span>
            <span className="font-extrabold text-gray-900 text-base">{data.learners.length}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-700 block text-[11px]">Topics Recorded</span>
            <span className="font-extrabold text-gray-900 text-base">{data.topics.length}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-700 block text-[11px]">Preparation Packs</span>
            <span className="font-extrabold text-gray-900 text-base">
              {Object.keys(data.packs).length}
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-700 block text-[11px]">Assessments</span>
            <span className="font-extrabold text-gray-900 text-base">
              {data.assessments.length}
            </span>
          </div>
        </div>
      </div>

      {/* Backup Export & Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm text-gray-900">Download Data Backup</h4>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Export all debate topics, complete 14-section preparation packs, learner notes, and rubric scores as a clean JSON backup file.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Backup</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm text-gray-900">Restore from Backup</h4>
            </div>
            <p className="text-xs text-gray-700">
              Paste the contents of a previously exported JSON backup file below to restore your records.
            </p>
          </div>

          <textarea
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder="Paste exported JSON here..."
            className="w-full h-20 p-2.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-emerald-500 font-mono resize-none"
          />

          <div className="flex items-center justify-between">
            {importStatus && (
              <span className="text-xs font-semibold text-emerald-800">{importStatus}</span>
            )}
            <button
              onClick={handleImportSubmit}
              disabled={!importJsonText.trim()}
              className="ml-auto inline-flex items-center gap-1.5 bg-gray-800 hover:bg-black text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-40"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Engine & API Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <span>Gemini AI Engine Connection Status</span>
        </h3>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800">Target Model:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-900">
              gemini-3.8-flash
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800">API Key Configured:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded ${
                systemHealth?.hasGeminiKey
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {systemHealth?.hasGeminiKey ? '✓ Active & Attached on Server' : 'Curriculum Fallback Active'}
            </span>
          </div>

          {!systemHealth?.hasGeminiKey && (
            <p className="text-[11px] text-gray-700 pt-2 border-t border-gray-200 leading-relaxed">
              💡 <em>Note:</em> Your Gemini API key is managed automatically in Google AI Studio via the <strong>Settings &gt; Secrets</strong> panel. When unconfigured, the app seamlessly runs on its verified Nigerian Curriculum Bank of 24 age-tailored motions and complete structured preparation packs, so you are never blocked.
            </p>
          )}
        </div>
      </div>

      {/* Reset to Defaults */}
      <div className="bg-red-50/40 border border-red-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-red-950 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Reset to Initial Curriculum Defaults</span>
          </h4>
          <p className="text-xs text-red-900/80">
            Clears any newly created topics and restores the default seed packs for Kelechi (JSS 1) and Amina (Primary 4).
          </p>
        </div>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-white hover:bg-red-50 border border-red-200 px-4 py-2 rounded-xl transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={async () => {
                await resetToDefaults();
                setShowResetConfirm(false);
              }}
              className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition cursor-pointer"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
