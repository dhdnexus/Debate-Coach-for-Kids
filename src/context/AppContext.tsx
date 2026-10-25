/**
 * Application Context and State Management for Debate Coach for Kids
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  AppStoreData,
  DebatePack,
  DebateTopic,
  Learner,
  SessionAssessment
} from '../types/debate';
import { INITIAL_APP_DATA } from '../data/initialData';
import {
  checkServerHealth,
  generatePackApi,
  generateTopicApi,
  loadAppData,
  saveAppData
} from '../services/api';

export type NavigationTab =
  | 'dashboard'
  | 'weekly-debates'
  | 'topic-library'
  | 'learners'
  | 'progress'
  | 'parent-guide'
  | 'settings';

interface AppContextType {
  data: AppStoreData;
  isLoading: boolean;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedLearnerId: string;
  setSelectedLearnerId: (id: string) => void;
  selectedTopicId: string | null;
  setSelectedTopicId: (id: string | null) => void;
  selectedPackId: string | null;
  setSelectedPackId: (id: string | null) => void;
  isGeneratingTopic: boolean;
  isGeneratingPack: boolean;
  generationError: string | null;
  generationWarning: string | null;
  systemHealth: { status: string; hasGeminiKey: boolean; model: string } | null;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
  clearNotification: () => void;
  updateLearner: (id: string, updates: Partial<Learner>) => Promise<void>;
  generateNewTopic: (
    learnerId: string,
    category?: string,
    difficulty?: string,
    weekNumber?: number
  ) => Promise<DebateTopic | null>;
  acceptTopic: (topicId: string) => Promise<void>;
  rejectTopic: (topicId: string) => Promise<void>;
  updateTopic: (topicId: string, updates: Partial<DebateTopic>) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  generatePackForTopic: (
    topicId: string,
    difficultyAdjustment?: 'easier' | 'harder'
  ) => Promise<DebatePack | null>;
  updatePack: (packId: string, pack: DebatePack) => Promise<void>;
  recordAssessment: (assessment: SessionAssessment) => Promise<void>;
  markSessionComplete: (topicId: string) => Promise<void>;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppStoreData>(INITIAL_APP_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>('learner-jss1');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>('topic-jss1-w1');
  const [selectedPackId, setSelectedPackId] = useState<string | null>('pack-jss1-w1');
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationWarning, setGenerationWarning] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<{ status: string; hasGeminiKey: boolean; model: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Initialize data on mount
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsLoading(true);
      try {
        const [appData, health] = await Promise.all([loadAppData(), checkServerHealth()]);
        if (isMounted) {
          setData(appData);
          setSystemHealth(health);
          if (appData.learners.length > 0) {
            setSelectedLearnerId(appData.learners[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to init app data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const triggerNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const clearNotification = () => setNotification(null);

  // Save changes helper
  const commitData = async (newData: AppStoreData) => {
    setData(newData);
    await saveAppData(newData);
  };

  // Update learner profile
  const updateLearner = async (id: string, updates: Partial<Learner>) => {
    const updatedLearners = data.learners.map((l) =>
      l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
    );
    const newData: AppStoreData = { ...data, learners: updatedLearners };
    await commitData(newData);
    triggerNotification('success', 'Learner profile updated successfully.');
  };

  // Generate a new topic
  const generateNewTopic = async (
    learnerId: string,
    category?: string,
    difficulty?: string,
    weekNumber?: number
  ): Promise<DebateTopic | null> => {
    const learner = data.learners.find((l) => l.id === learnerId);
    if (!learner) return null;

    setIsGeneratingTopic(true);
    setGenerationError(null);
    setGenerationWarning(null);

    const pastMotions = data.topics
      .filter((t) => t.learnerId === learnerId)
      .map((t) => t.motion);

    const targetWeek = weekNumber || data.currentWeekNumber;

    try {
      const result = await generateTopicApi(
        learner,
        category,
        pastMotions,
        difficulty || (learner.classLevel.includes('4') ? 'Beginning' : 'Intermediate'),
        targetWeek
      );

      if (result.success && result.topic) {
        const newTopic = result.topic;
        const newTopics = [newTopic, ...data.topics];
        const newData: AppStoreData = { ...data, topics: newTopics };
        await commitData(newData);
        setSelectedTopicId(newTopic.id);

        if (result.warning) {
          setGenerationWarning(result.warning);
        }
        triggerNotification(
          'success',
          `New topic generated for ${learner.name}: "${newTopic.title}"`
        );
        return newTopic;
      }
      throw new Error('Failed to generate valid topic');
    } catch (err: any) {
      console.error('Topic generation failed:', err);
      setGenerationError(err.message || 'Generation failed. Please try again.');
      triggerNotification('error', 'Topic generation failed. Please try again.');
      return null;
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  // Accept a topic
  const acceptTopic = async (topicId: string) => {
    const updatedTopics = data.topics.map((t) =>
      t.id === topicId ? { ...t, approvalStatus: 'Accepted' as const } : t
    );
    const newData: AppStoreData = { ...data, topics: updatedTopics };
    await commitData(newData);
    triggerNotification('success', 'Topic approved! You can now generate or view its debate pack.');
  };

  // Reject a topic
  const rejectTopic = async (topicId: string) => {
    const updatedTopics = data.topics.map((t) =>
      t.id === topicId ? { ...t, approvalStatus: 'Rejected' as const } : t
    );
    const newData: AppStoreData = { ...data, topics: updatedTopics };
    await commitData(newData);
    triggerNotification('info', 'Topic rejected. You can generate an alternative anytime.');
  };

  // Update topic metadata
  const updateTopic = async (topicId: string, updates: Partial<DebateTopic>) => {
    const updatedTopics = data.topics.map((t) =>
      t.id === topicId ? { ...t, ...updates } : t
    );
    const newData: AppStoreData = { ...data, topics: updatedTopics };
    await commitData(newData);
    triggerNotification('success', 'Topic details updated.');
  };

  // Delete a topic
  const deleteTopic = async (topicId: string) => {
    const topic = data.topics.find((t) => t.id === topicId);
    const updatedTopics = data.topics.filter((t) => t.id !== topicId);
    const newPacks = { ...data.packs };
    if (topic?.packId) {
      delete newPacks[topic.packId];
    }
    const newData: AppStoreData = { ...data, topics: updatedTopics, packs: newPacks };
    await commitData(newData);
    triggerNotification('info', 'Topic removed from history.');
  };

  // Generate complete debate pack for a topic
  const generatePackForTopic = async (
    topicId: string,
    difficultyAdjustment?: 'easier' | 'harder'
  ): Promise<DebatePack | null> => {
    const topic = data.topics.find((t) => t.id === topicId);
    if (!topic) return null;
    const learner = data.learners.find((l) => l.id === topic.learnerId);
    if (!learner) return null;

    setIsGeneratingPack(true);
    setGenerationError(null);
    setGenerationWarning(null);

    try {
      const result = await generatePackApi(topic, learner, difficultyAdjustment);
      if (result.success && result.pack) {
        const newPack = result.pack;
        const updatedPacks = { ...data.packs, [newPack.id]: newPack };
        const updatedTopics = data.topics.map((t) =>
          t.id === topicId
            ? { ...t, packId: newPack.id, completionStatus: 'Ready for practice' as const }
            : t
        );
        const newData: AppStoreData = {
          ...data,
          packs: updatedPacks,
          topics: updatedTopics
        };
        await commitData(newData);
        setSelectedPackId(newPack.id);
        setSelectedTopicId(topic.id);

        if (result.warning) {
          setGenerationWarning(result.warning);
        }
        triggerNotification(
          'success',
          `Complete debate pack generated for ${learner.name}! Ready for practice.`
        );
        return newPack;
      }
      throw new Error('Failed to create complete debate pack');
    } catch (err: any) {
      console.error('Debate pack generation error:', err);
      setGenerationError(err.message || 'Failed to generate debate pack');
      triggerNotification('error', 'Pack generation failed. Please try again.');
      return null;
    } finally {
      setIsGeneratingPack(false);
    }
  };

  // Update an existing pack (e.g. parent edits sample speech or notes)
  const updatePack = async (packId: string, updatedPack: DebatePack) => {
    const newPacks = {
      ...data.packs,
      [packId]: {
        ...updatedPack,
        version: (updatedPack.version || 1) + 1,
        updatedAt: new Date().toISOString()
      }
    };
    const newData: AppStoreData = { ...data, packs: newPacks };
    await commitData(newData);
    triggerNotification('success', 'Debate pack edits saved successfully.');
  };

  // Record an assessment session
  const recordAssessment = async (assessment: SessionAssessment) => {
    const newAssessments = [assessment, ...data.assessments];
    // Update topic status to Completed
    const updatedTopics = data.topics.map((t) =>
      t.id === assessment.topicId ? { ...t, completionStatus: 'Completed' as const } : t
    );
    const newData: AppStoreData = {
      ...data,
      assessments: newAssessments,
      topics: updatedTopics
    };
    await commitData(newData);
    triggerNotification('success', 'Debate assessment recorded! Progress updated.');
  };

  // Mark session complete
  const markSessionComplete = async (topicId: string) => {
    const updatedTopics = data.topics.map((t) =>
      t.id === topicId ? { ...t, completionStatus: 'Completed' as const } : t
    );
    const newData: AppStoreData = { ...data, topics: updatedTopics };
    await commitData(newData);
    triggerNotification('success', 'Weekly debate marked as completed!');
  };

  // Export JSON backup
  const exportDataJson = (): string => {
    return JSON.stringify(data, null, 2);
  };

  // Import JSON backup
  const importDataJson = async (jsonStr: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonStr) as AppStoreData;
      if (!parsed.learners || !parsed.topics || !parsed.packs) {
        throw new Error('Missing required schema fields');
      }
      await commitData(parsed);
      triggerNotification('success', 'Debate records imported successfully.');
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      triggerNotification('error', 'Invalid JSON backup format.');
      return false;
    }
  };

  // Reset to initial defaults
  const resetToDefaults = async () => {
    await commitData(INITIAL_APP_DATA);
    setSelectedLearnerId('learner-jss1');
    setSelectedTopicId('topic-jss1-w1');
    setSelectedPackId('pack-jss1-w1');
    triggerNotification('info', 'Reset to initial Nigerian debate curriculum defaults.');
  };

  return (
    <AppContext.Provider
      value={{
        data,
        isLoading,
        activeTab,
        setActiveTab,
        selectedLearnerId,
        setSelectedLearnerId,
        selectedTopicId,
        setSelectedTopicId,
        selectedPackId,
        setSelectedPackId,
        isGeneratingTopic,
        isGeneratingPack,
        generationError,
        generationWarning,
        systemHealth,
        notification,
        clearNotification,
        updateLearner,
        generateNewTopic,
        acceptTopic,
        rejectTopic,
        updateTopic,
        deleteTopic,
        generatePackForTopic,
        updatePack,
        recordAssessment,
        markSessionComplete,
        exportDataJson,
        importDataJson,
        resetToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
