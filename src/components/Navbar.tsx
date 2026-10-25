/**
 * Main Navigation and Header Bar
 */

import React from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import {
  BookOpen,
  Calendar,
  Sparkles,
  Users,
  Award,
  BookMarked,
  Settings,
  Printer,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    data,
    selectedLearnerId,
    setSelectedLearnerId,
    selectedPackId,
    setSelectedTopicId,
    setSelectedPackId
  } = useApp();

  const activeLearner = data.learners.find((l) => l.id === selectedLearnerId) || data.learners[0];

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Calendar className="w-4 h-4" /> },
    { id: 'weekly-debates', label: 'Weekly Debates', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'topic-library', label: 'Topic Generator', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'learners', label: 'Learners', icon: <Users className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress & Rubrics', icon: <Award className="w-4 h-4" /> },
    { id: 'parent-guide', label: 'Parent Guide', icon: <BookMarked className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const handlePrint = () => {
    // If not on weekly debates, switch there first so pack is displayed
    if (activeTab !== 'weekly-debates') {
      setActiveTab('weekly-debates');
      setTimeout(() => window.print(), 300);
    } else {
      window.print();
    }
  };

  return (
    <header className="no-print bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-xs">
      {/* Top Banner with Nigerian Context & Quick Info */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-700/60 px-2 py-0.5 rounded-full font-medium text-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Nigeria Civic Edition
            </span>
            <span className="text-emerald-200 hidden sm:inline">|</span>
            <span className="text-emerald-100 hidden sm:inline">
              Week {data.currentWeekNumber} Debate Curriculum • Primary 4 & JSS 1
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-md text-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Parent-Managed • Child Safe</span>
            </div>
            {selectedPackId && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-md font-medium transition cursor-pointer"
                title="Print the active debate pack"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print Pack</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  Debate Coach for Kids
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Home Lab
                </span>
              </div>
              <p className="text-xs text-gray-700">
                Weekly AI-powered public speaking & critical thinking for Nigerian children
              </p>
            </div>
          </div>

          {/* Learner Switcher Pill */}
          <div className="flex items-center gap-2 bg-emerald-50/80 p-1.5 rounded-xl border border-emerald-100 self-start md:self-auto">
            <span className="text-xs font-medium text-emerald-900 px-2">Learner:</span>
            {data.learners.map((learner) => {
              const isSelected = learner.id === selectedLearnerId;
              const isJSS = learner.classLevel.includes('JSS');
              return (
                <button
                  key={learner.id}
                  onClick={() => {
                    setSelectedLearnerId(learner.id);
                    // Match topic
                    const topic = data.topics.find((t) => t.learnerId === learner.id);
                    if (topic) {
                      setSelectedTopicId(topic.id);
                      if (topic.packId) setSelectedPackId(topic.packId);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? isJSS
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-white' : isJSS ? 'bg-blue-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span>{learner.name}</span>
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-gray-200/80 text-gray-600'
                    }`}
                  >
                    {learner.classLevel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pt-3 mt-1 border-t border-gray-100 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80 shadow-xs'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
