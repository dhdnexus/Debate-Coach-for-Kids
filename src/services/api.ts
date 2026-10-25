/**
 * API Client for Debate Coach for Kids
 * Connects frontend to Express backend proxy endpoints
 */

import { AppStoreData, DebatePack, DebateTopic, Learner } from '../types/debate';
import { INITIAL_APP_DATA } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'debate_coach_kids_app_data_v1';

export async function checkServerHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (e) {
    return { status: 'fallback', hasGeminiKey: false, model: 'local' };
  }
}

export async function loadAppData(): Promise<AppStoreData> {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && json.data.learners) {
        // Cache to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend fetch failed, attempting localStorage:', err);
  }

  // LocalStorage fallback
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('LocalStorage parse error:', e);
  }

  return INITIAL_APP_DATA;
}

export async function saveAppData(data: AppStoreData): Promise<boolean> {
  // Always update localStorage first for instant responsiveness
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }

  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend persistence error (data cached in localStorage):', err);
    return false;
  }
}

export async function generateTopicApi(
  learner: Learner,
  category?: string,
  previousMotions: string[] = [],
  requestedDifficulty: string = 'Intermediate',
  weekNumber: number = 1
): Promise<{ success: boolean; topic: DebateTopic; mode?: string; warning?: string }> {
  try {
    const res = await fetch('/api/gemini/generate-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        learner,
        category,
        previousMotions,
        requestedDifficulty,
        weekNumber
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('Topic API error:', err);
    throw err;
  }
}

export async function generatePackApi(
  topic: DebateTopic,
  learner: Learner,
  difficultyAdjustment?: 'easier' | 'harder'
): Promise<{ success: boolean; pack: DebatePack; mode?: string; warning?: string }> {
  try {
    const res = await fetch('/api/gemini/generate-pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        learner,
        difficultyAdjustment
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('Pack API error:', err);
    throw err;
  }
}

export async function assessSpeechApi(
  notes: string,
  learner: Learner,
  motion: string,
  scores?: Record<string, number>
) {
  try {
    const res = await fetch('/api/gemini/assess-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, learner, motion, scores })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      success: true,
      feedback: {
        whatWentWell: 'Clear points and good courage standing up to debate.',
        improvementTarget: 'Practice pausing between ideas.',
        coachingTip: 'Celebrate bravery first before discussing technical adjustments.',
        suggestedNextGoal: 'Use one new Nigerian real-life example next week.'
      }
    };
  }
}
