/**
 * Debate Coach for Kids - Main Application Entry
 * Full-Stack AI-Powered Educational Debate App for Nigerian Children
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DebatePackViewer } from './components/DebatePackViewer';
import { TopicGenerator } from './components/TopicGenerator';
import { LearnerProfiles } from './components/LearnerProfiles';
import { ProgressDashboard } from './components/ProgressDashboard';
import { ParentGuide } from './components/ParentGuide';
import { SettingsView } from './components/SettingsView';
import { PrintView } from './components/PrintView';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, notification, clearNotification, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-gray-700 tracking-wide">
            Loading Nigerian Debate Curriculum...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-gray-900 flex flex-col font-sans antialiased">
      <Navbar />

      {/* Global Notification Toast */}
      {notification && (
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 pt-3 w-full">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs transition ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              {notification.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              {notification.type === 'info' && (
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>

            <button
              onClick={clearNotification}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="no-print flex-1 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 w-full">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'weekly-debates' && <DebatePackViewer />}
        {activeTab === 'topic-library' && <TopicGenerator />}
        {activeTab === 'learners' && <LearnerProfiles />}
        {activeTab === 'progress' && <ProgressDashboard />}
        {activeTab === 'parent-guide' && <ParentGuide />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Print View for browser printing only */}
      <PrintView />

      {/* Footer */}
      <footer className="no-print bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>Debate Coach for Kids</strong> • Nigeria Civic Public Speaking Lab (P4 & JSS 1)
          </span>
          <span>
            Parent-Guided • Safe & Ad-Free • Grounded in Nigerian Community & Democratic Values
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
