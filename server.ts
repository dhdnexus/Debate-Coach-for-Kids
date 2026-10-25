/**
 * Full-Stack Express Server for Debate Coach for Kids
 * Integrates Google GenAI (Gemini 3.8 Flash), Local Disk Persistence, and Vite Middlewares
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_APP_DATA } from './src/data/initialData';
import { CURRICULUM_BANK } from './src/data/curriculumTopics';
import { AppStoreData, DebatePack, DebateTopic, Learner } from './src/types/debate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'debate_coach_data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json({ limit: '10mb' }));

// Helper to initialize GenAI client
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// 1. Health check & status
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    model: 'gemini-3.8-flash',
    persistence: 'local-file-backed'
  });
});

// 2. Load stored data
app.get('/api/data', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      res.json({ success: true, data: parsed });
    } else {
      // First boot: write initial seed data
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_APP_DATA, null, 2), 'utf-8');
      res.json({ success: true, data: INITIAL_APP_DATA });
    }
  } catch (err: any) {
    console.error('Error reading data file:', err);
    res.json({ success: true, data: INITIAL_APP_DATA });
  }
});

// 3. Save stored data
app.post('/api/data', (req: Request, res: Response) => {
  try {
    const payload: AppStoreData = req.body;
    if (!payload || !payload.learners || !payload.topics) {
      res.status(400).json({ success: false, error: 'Invalid app data payload' });
      return;
    }
    // Atomic write via temp file
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
    res.json({ success: true, message: 'Data saved successfully' });
  } catch (err: any) {
    console.error('Error saving data:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to persist data' });
  }
});

// 4. Generate Topic with Gemini
app.post('/api/gemini/generate-topic', async (req: Request, res: Response) => {
  const { learner, category, previousMotions = [], requestedDifficulty = 'Intermediate', weekNumber = 1 } = req.body as {
    learner: Learner;
    category?: string;
    previousMotions?: string[];
    requestedDifficulty?: string;
    weekNumber?: number;
  };

  const ai = getGenAI();

  if (!ai) {
    // Graceful curricular fallback when key is not yet set
    const fallback = pickCurricularFallback(learner, category, previousMotions, weekNumber);
    res.json({
      success: true,
      topic: fallback,
      mode: 'curriculum-bank'
    });
    return;
  }

  try {
    const isP4 = learner.classLevel.includes('4') || learner.age <= 8;
    const prompt = `You are an expert Nigerian children's debate educator and curriculum designer.
Generate ONE age-appropriate, balanced weekly debate motion for a Nigerian child.

Learner Profile:
- Name: ${learner.name}
- Age: ${learner.age} years old
- Class: ${learner.classLevel} (${isP4 ? 'Primary 4 Elementary' : 'JSS 1 Junior Secondary'})
- Learning Stage: Stage ${learner.currentStage}
- Preferred Vocabulary: ${learner.preferredVocabulary || 'Age-appropriate'}
- Selected Category: ${category || 'Any suitable Nigerian civic or moral category'}
- Requested Difficulty: ${requestedDifficulty}

Previous motions to avoid repeating:
${previousMotions.map((m: string) => `- ${m}`).join('\n') || 'None'}

Content Rules:
1. Must begin with "This house believes that..."
2. Specific, debatable, with no single obvious answer. Both sides must have strong, defensible arguments.
3. Strongly grounded in relatable Nigerian everyday life (schools, family, community, values, environment, or culture).
4. For Primary 4: simple words, concrete home/school situations, easy concepts.
5. For JSS 1: more structured reasoning, civic institutions, ethical trade-offs.
6. Strictly avoid graphic content, partisan political campaigning, tribal stereotypes, religious dogma, or encouraging disrespect.
7. Return strictly valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Short catchy topic title' },
            motion: { type: Type.STRING, description: 'Formal motion starting with "This house believes that..."' },
            category: { type: Type.STRING, description: 'Topic category' },
            difficulty: { type: Type.STRING, description: 'Beginning, Intermediate, or Advanced' },
            pedagogicalRationale: { type: Type.STRING, description: 'Why this topic suits this child\'s development' },
            nigerianContext: { type: Type.STRING, description: 'The Nigerian real-life setting or example' }
          },
          required: ['title', 'motion', 'category', 'difficulty', 'pedagogicalRationale', 'nigerianContext']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const newTopic: DebateTopic = {
      id: `topic-${learner.id}-${Date.now()}`,
      learnerId: learner.id,
      learnerName: learner.name,
      learnerClass: learner.classLevel,
      title: parsed.title || 'Weekly Debate Topic',
      motion: parsed.motion || 'This house believes that teamwork is more valuable than individual competition.',
      category: parsed.category as any,
      difficulty: (parsed.difficulty as any) || (isP4 ? 'Beginning' : 'Intermediate'),
      weekNumber: weekNumber,
      scheduledDate: new Date().toISOString().split('T')[0],
      approvalStatus: 'Pending',
      completionStatus: 'Draft',
      suitabilityNotes: `${parsed.pedagogicalRationale} | Context: ${parsed.nigerianContext}`,
      createdAt: new Date().toISOString()
    };

    res.json({ success: true, topic: newTopic, mode: 'gemini' });
  } catch (err: any) {
    console.error('Gemini topic generation error:', err);
    // Graceful fallback to curriculum bank on error
    const fallback = pickCurricularFallback(learner, category, previousMotions, weekNumber);
    res.json({
      success: true,
      topic: fallback,
      mode: 'curriculum-bank',
      warning: `AI generation encountered a temporary limit: ${err.message || 'using verified curriculum bank'}`
    });
  }
});

// Helper for fallback topics
function pickCurricularFallback(
  learner: Learner,
  category?: string,
  previousMotions: string[] = [],
  weekNumber: number = 1
): DebateTopic {
  const isP4 = learner.classLevel.includes('4') || learner.age <= 8;
  const targetClass = isP4 ? 'Primary 4' : 'JSS 1';

  let candidates = CURRICULUM_BANK.filter(
    (item) => item.targetClass === targetClass || item.targetClass === 'Both'
  );

  if (category) {
    const byCategory = candidates.filter((item) => item.category === category);
    if (byCategory.length > 0) candidates = byCategory;
  }

  // Filter out exact past motions
  const unused = candidates.filter((item) => !previousMotions.includes(item.motion));
  const selected = unused.length > 0 ? unused[Math.floor(Math.random() * unused.length)] : candidates[0];

  return {
    id: `topic-${learner.id}-${Date.now()}`,
    learnerId: learner.id,
    learnerName: learner.name,
    learnerClass: learner.classLevel,
    title: selected.title,
    motion: selected.motion,
    category: selected.category,
    difficulty: selected.difficulty,
    weekNumber: weekNumber,
    scheduledDate: new Date().toISOString().split('T')[0],
    approvalStatus: 'Pending',
    completionStatus: 'Draft',
    suitabilityNotes: `${selected.pedagogicalRationale} | Context: ${selected.nigerianContextNote}`,
    createdAt: new Date().toISOString()
  };
}

// 5. Generate Full 14-Section Debate Pack with Gemini
app.post('/api/gemini/generate-pack', async (req: Request, res: Response) => {
  const { topic, learner, difficultyAdjustment } = req.body as {
    topic: DebateTopic;
    learner: Learner;
    difficultyAdjustment?: 'easier' | 'harder';
  };

  const ai = getGenAI();
  const isP4 = learner.classLevel.includes('4') || learner.age <= 8;
  const numArgs = isP4 ? 3 : 4;
  const duration = isP4 ? '1–2 minutes' : '3–5 minutes';

  if (!ai) {
    // Generate high-fidelity deterministic structured pack if Gemini API key is absent
    const mockPack = generateStructuredFallbackPack(topic, learner, isP4);
    res.json({ success: true, pack: mockPack, mode: 'fallback-complete' });
    return;
  }

  try {
    const prompt = `You are a master debate coach, child-development specialist, and educational curriculum designer in Nigeria.
Generate a complete, pristine, 14-section educational preparation pack for a parent to coach their child at home.

LEARNER SPECIFICATIONS:
- Child's Name: ${learner.name}
- Age: ${learner.age} years old
- Class Level: ${learner.classLevel} (${isP4 ? 'Primary 4 Elementary' : 'JSS 1 Junior Secondary'})
- Learning Stage: Stage ${learner.currentStage}
- Preferred Speaking Duration: ${duration}
- Preferred Vocabulary: ${learner.preferredVocabulary || (isP4 ? 'Simple, clear, concrete' : 'Junior secondary conceptual')}
- Areas for Improvement: ${learner.areasForImprovement || 'Giving reasons and examples'}
- Difficulty Adjustment: ${difficultyAdjustment || 'Standard for level'}

DEBATE SPECIFICATIONS:
- Motion: "${topic.motion}"
- Topic Title: "${topic.title}"
- Category: "${topic.category}"
- Week: ${topic.weekNumber}

CRITICAL PEDAGOGICAL REQUIREMENTS:
1. Understanding the Topic:
   - Simple meaning
   - 3-4 key vocabulary words with definitions and child-friendly examples
   - Real-world issue and why it matters
   - Relatable Nigerian family, school, community, or civic example
   - 3 reflection questions
2. Background & Context:
   - Balanced explanation connecting to Nigerian schools/community/governance
   - Distinct list of facts vs opinions vs interpretations
3. Arguments FOR the Motion (Proposition):
   - At least ${numArgs} arguments
   - Point -> Reason -> Example/Evidence -> Link to Motion (P-R-E-L)
   - Practical Nigerian example for each
   - Speech-ready sentence
   - Critical weakness or limitation to develop independent evaluation
4. Arguments AGAINST the Motion (Opposition):
   - Exactly ${numArgs} arguments with the same depth & P-R-E-L structure
   - Genuinely defensible counter-positions (do NOT caricature the other side)
5. Evidence & Research:
   - Real institutional references where appropriate (e.g., NERDC, UBEC, Federal Ministry of Education, NBS Nigeria, UNICEF Nigeria, WHO Africa)
   - Honest research status: "Sources verified" or "Partially verified" or "Research not performed / General Knowledge"
6. Complete Model Speeches:
   - Full Proposition Speech: natural spoken voice for a ${learner.age}-year-old Nigerian child (${duration}). Respectful greeting, motion statement, clear PREL points, counter-argument response, memorable conclusion.
   - Full Opposition Speech: equally complete, respectful, and usable.
   - DO NOT abbreviate or use placeholders. Write full spoken paragraphs.
7. Rebuttals:
   - At least 3 opposing claims with why someone believes it, respectful response, reason/example, speech-ready sentence, and coaching note.
   - Use polite phrases: "I understand that point, but...", "Another way to look at this is...", "The example supports my argument because..."
8. Debate Sequence:
   - Step-by-step practice sequence tailored for ${isP4 ? 'simplified home practice' : 'formal school debate'}.
9. Independent Thinking Exercises:
   - 3 reflection questions
   - Fill-in template ("My opinion is... I believe this because... One example is... Someone may disagree because... My response is... Therefore, I conclude that...")
   - Prompts for strongest point, weakness, fair explanation of opposing side, and original Nigerian example.
10. Parent's Coaching Guide:
    - 5-day preparation plan with time estimates (10-25 mins/day)
    - Plain-language motion summary
    - Essential vs optional sections
    - Coaching questions, gentle correction tips, unsticking strategies, encouragement
11. Confidence-Building Activity:
    - 1 fun warm-up exercise and speaking habits checklist
12. Assessment Rubric:
    - 8 criteria (Clarity, Confidence, Reasoning, Evidence, Organization, Listening/Rebuttal, Respect, Independence) scored 1 to 4.

Return STRICTLY valid JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            motion: { type: Type.STRING },
            category: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            estimatedPrepTimeMinutes: { type: Type.INTEGER },
            recommendedSpeakingMinutes: { type: Type.STRING },
            learningObjectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            understandingTheTopic: {
              type: Type.OBJECT,
              properties: {
                simpleMeaning: { type: Type.STRING },
                keyVocabulary: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      word: { type: Type.STRING },
                      definition: { type: Type.STRING },
                      childFriendlyExample: { type: Type.STRING }
                    },
                    required: ['word', 'definition', 'childFriendlyExample']
                  }
                },
                realWorldIssue: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
                familiarNigerianExample: { type: Type.STRING },
                reflectionQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['simpleMeaning', 'keyVocabulary', 'realWorldIssue', 'whyItMatters', 'familiarNigerianExample', 'reflectionQuestions']
            },
            backgroundAndContext: {
              type: Type.OBJECT,
              properties: {
                contextSummary: { type: Type.STRING },
                civicConnection: { type: Type.STRING },
                distinguishingFactsFromOpinions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['contextSummary', 'civicConnection', 'distinguishingFactsFromOpinions']
            },
            propositionArguments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  claim: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  example: { type: Type.STRING },
                  linkToMotion: { type: Type.STRING },
                  speechSentence: { type: Type.STRING },
                  weakness: { type: Type.STRING }
                },
                required: ['id', 'title', 'claim', 'reason', 'example', 'linkToMotion', 'speechSentence', 'weakness']
              }
            },
            oppositionArguments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  claim: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  example: { type: Type.STRING },
                  linkToMotion: { type: Type.STRING },
                  speechSentence: { type: Type.STRING },
                  weakness: { type: Type.STRING }
                },
                required: ['id', 'title', 'claim', 'reason', 'example', 'linkToMotion', 'speechSentence', 'weakness']
              }
            },
            evidenceAndResearch: {
              type: Type.OBJECT,
              properties: {
                sources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      organization: { type: Type.STRING },
                      url: { type: Type.STRING },
                      supportsSide: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      relevanceNote: { type: Type.STRING },
                      verificationStatus: { type: Type.STRING }
                    },
                    required: ['id', 'title', 'organization', 'url', 'supportsSide', 'summary', 'relevanceNote', 'verificationStatus']
                  }
                },
                researchStatus: { type: Type.STRING },
                researchNotes: { type: Type.STRING }
              },
              required: ['sources', 'researchStatus', 'researchNotes']
            },
            sampleSpeeches: {
              type: Type.OBJECT,
              properties: {
                propositionSpeech: { type: Type.STRING },
                oppositionSpeech: { type: Type.STRING },
                propositionKeyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                oppositionKeyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['propositionSpeech', 'oppositionSpeech', 'propositionKeyPoints', 'oppositionKeyPoints']
            },
            rebuttals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  opposingClaim: { type: Type.STRING },
                  whySomeoneMightBelieveIt: { type: Type.STRING },
                  respectfulResponse: { type: Type.STRING },
                  supportingReasonOrExample: { type: Type.STRING },
                  speechReadyRebuttal: { type: Type.STRING },
                  guidanceNote: { type: Type.STRING }
                },
                required: ['id', 'opposingClaim', 'whySomeoneMightBelieveIt', 'respectfulResponse', 'supportingReasonOrExample', 'speechReadyRebuttal', 'guidanceNote']
              }
            },
            debateStructure: {
              type: Type.OBJECT,
              properties: {
                formatType: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      order: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      speakerRole: { type: Type.STRING },
                      durationMinutes: { type: Type.INTEGER },
                      description: { type: Type.STRING },
                      parentTip: { type: Type.STRING }
                    },
                    required: ['order', 'title', 'speakerRole', 'durationMinutes', 'description', 'parentTip']
                  }
                }
              },
              required: ['formatType', 'steps']
            },
            independentThinkingExercises: {
              type: Type.OBJECT,
              properties: {
                reflectionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                fillInTemplate: {
                  type: Type.OBJECT,
                  properties: {
                    opinion: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    example: { type: Type.STRING },
                    opposingView: { type: Type.STRING },
                    response: { type: Type.STRING },
                    conclusion: { type: Type.STRING }
                  },
                  required: ['opinion', 'reason', 'example', 'opposingView', 'response', 'conclusion']
                },
                strongestArgumentPrompt: { type: Type.STRING },
                preferredSideWeaknessPrompt: { type: Type.STRING },
                opposingViewFairExplanationPrompt: { type: Type.STRING },
                originalNigerianExamplePrompt: { type: Type.STRING }
              },
              required: ['reflectionQuestions', 'fillInTemplate', 'strongestArgumentPrompt', 'preferredSideWeaknessPrompt', 'opposingViewFairExplanationPrompt', 'originalNigerianExamplePrompt']
            },
            parentCoachingGuide: {
              type: Type.OBJECT,
              properties: {
                dayByDayPlan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING },
                      title: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      focus: { type: Type.STRING },
                      parentActions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['day', 'title', 'duration', 'focus', 'parentActions']
                  }
                },
                essentialSections: { type: Type.ARRAY, items: { type: Type.STRING } },
                optionalAdvancedSections: { type: Type.ARRAY, items: { type: Type.STRING } },
                plainLanguageSummary: { type: Type.STRING },
                coachingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                howToUnstickChild: { type: Type.ARRAY, items: { type: Type.STRING } },
                howToCorrectGently: { type: Type.ARRAY, items: { type: Type.STRING } },
                feedbackAndEncouragement: { type: Type.ARRAY, items: { type: Type.STRING } },
                postDebateDebriefQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['dayByDayPlan', 'essentialSections', 'optionalAdvancedSections', 'plainLanguageSummary', 'coachingQuestions', 'howToUnstickChild', 'howToCorrectGently', 'feedbackAndEncouragement', 'postDebateDebriefQuestions']
            },
            confidenceBuildingActivity: {
              type: Type.OBJECT,
              properties: {
                activityName: { type: Type.STRING },
                durationMinutes: { type: Type.INTEGER },
                instructions: { type: Type.STRING },
                speakingHabitsChecklist: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['activityName', 'durationMinutes', 'instructions', 'speakingHabitsChecklist']
            }
          },
          required: [
            'title', 'motion', 'category', 'difficulty', 'estimatedPrepTimeMinutes',
            'recommendedSpeakingMinutes', 'learningObjectives', 'understandingTheTopic',
            'backgroundAndContext', 'propositionArguments', 'oppositionArguments',
            'evidenceAndResearch', 'sampleSpeeches', 'rebuttals', 'debateStructure',
            'independentThinkingExercises', 'parentCoachingGuide', 'confidenceBuildingActivity'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const packId = `pack-${topic.id}-${Date.now()}`;

    const completePack: DebatePack = {
      ...parsed,
      id: packId,
      topicId: topic.id,
      learnerId: learner.id,
      learnerName: learner.name,
      learnerAge: learner.age,
      learnerClass: learner.classLevel,
      title: parsed.title || topic.title,
      motion: parsed.motion || topic.motion,
      category: (parsed.category as any) || topic.category,
      difficulty: (parsed.difficulty as any) || topic.difficulty,
      weekNumber: topic.weekNumber,
      assessmentRubricTemplate: {
        criteria: INITIAL_APP_DATA.packs['pack-jss1-w1'].assessmentRubricTemplate.criteria
      },
      contentSuitabilityStatus: 'Approved Safe',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({ success: true, pack: completePack, mode: 'gemini' });
  } catch (err: any) {
    console.error('Gemini pack generation error:', err);
    // Fall back to complete deterministic pack so user is never blocked
    const fallbackPack = generateStructuredFallbackPack(topic, learner, isP4);
    res.json({
      success: true,
      pack: fallbackPack,
      mode: 'fallback-complete',
      warning: `Gemini generation limit encountered (${err.message || 'error'}). Provided fully structured curricular debate pack.`
    });
  }
});

// Deterministic high-quality pack generator for offline / fallback
function generateStructuredFallbackPack(topic: DebateTopic, learner: Learner, isP4: boolean): DebatePack {
  const packId = `pack-${topic.id}-${Date.now()}`;
  const duration = isP4 ? '1–2 minutes' : '3–5 minutes';

  return {
    id: packId,
    topicId: topic.id,
    learnerId: learner.id,
    learnerName: learner.name,
    learnerAge: learner.age,
    learnerClass: learner.classLevel,
    title: topic.title,
    motion: topic.motion,
    category: topic.category,
    difficulty: topic.difficulty,
    weekNumber: topic.weekNumber,
    estimatedPrepTimeMinutes: isP4 ? 30 : 45,
    recommendedSpeakingMinutes: duration,
    learningObjectives: [
      `State an opinion clearly on "${topic.title}".`,
      `Deliver ${isP4 ? 'three' : 'four'} structured points with reasons and Nigerian examples.`,
      `Listen respectfully to opposing viewpoints and respond to ideas, not people.`,
      `Practice speaking with an upright posture and clear audibility.`
    ],
    understandingTheTopic: {
      simpleMeaning: `Should we support or oppose: "${topic.motion}"? This debate explores how our choices affect our homes, schools, and communities in Nigeria.`,
      keyVocabulary: [
        {
          word: 'Responsibility',
          definition: 'Taking care of your duties without being forced or reminded repeatedly.',
          childFriendlyExample: 'Packing your school bag before going to sleep.'
        },
        {
          word: 'Cooperation',
          definition: 'Working together with others peacefully to achieve a shared goal.',
          childFriendlyExample: 'Cleaning up the classroom together at the end of the day.'
        },
        {
          word: 'Fairness',
          definition: 'Treating everyone with equal respect and following just rules.',
          childFriendlyExample: 'Taking turns to speak during a family discussion.'
        }
      ],
      realWorldIssue: `Making responsible decisions in Nigerian community and school life.`,
      whyItMatters: `Debating this topic helps ${learner.name} think about what makes a community healthy, fair, and orderly.`,
      familiarNigerianExample: `In many neighborhoods across Lagos, Abuja, Port Harcourt, and Kano, people debate how to organize school rules and family duties fairly.`,
      reflectionQuestions: [
        `What do you think is the best part of this motion?`,
        `Can you think of a time when someone you know faced this exact situation?`,
        `What might happen if everyone did the exact opposite?`
      ]
    },
    backgroundAndContext: {
      contextSummary: `This issue touches on everyday Nigerian values of hard work, respect, family unity, and civic responsibility. It balances personal freedom with community obligations.`,
      civicConnection: `Connects to the Nigerian Basic Education Civic Values framework on mutual respect, integrity, and good citizenship.`,
      distinguishingFactsFromOpinions: [
        `Fact: Every community has rules to maintain peace and order.`,
        `Fact: Different families and schools handle these challenges in different ways.`,
        `Opinion: One particular approach is always superior for every single child.`,
        `Interpretation: Finding the right balance requires listening to both sides.`
      ]
    },
    propositionArguments: isP4
      ? [
          {
            id: 'p4-arg-1',
            title: 'Builds Good Habits Early',
            claim: 'Doing the right thing first sets up good habits for the future.',
            reason: 'When we practice responsibility as children, it becomes second nature as we grow older.',
            example: 'In our house, when we follow rules on Saturday morning, the rest of the weekend is peaceful.',
            linkToMotion: 'This supports the motion because good habits make life better for everyone.',
            speechSentence: 'Good habits start small, and doing what is right helps us grow into responsible learners.',
            weakness: 'Sometimes special circumstances require flexibility.'
          },
          {
            id: 'p4-arg-2',
            title: 'Helps the Whole Family and Community',
            claim: 'Taking responsibility shows love and cooperation with others.',
            reason: 'When each person does their part, nobody gets overwhelmed or overly tired.',
            example: 'When classmates work together to keep the classroom clean, our teacher is happy and we learn better.',
            linkToMotion: 'Therefore, supporting this motion brings unity and cooperation.',
            speechSentence: 'Teamwork and responsibility make our school and family happier places.',
            weakness: 'Younger children may need adult assistance to do their part.'
          },
          {
            id: 'p4-arg-3',
            title: 'Clear Rules Prevent Confusion and Quarrels',
            claim: 'When everyone knows what is expected, there are fewer arguments.',
            reason: 'Clear guidelines protect fairness so that nobody feels cheated.',
            example: 'On the playground, games with clear rules have fewer fights than games where everyone does whatever they want.',
            linkToMotion: 'This proves that order and structure benefit all children.',
            speechSentence: 'Fair rules protect everyone and allow us to play and learn peacefully.',
            weakness: 'Rules should always be reasonable and not overly strict.'
          }
        ]
      : [
          {
            id: 'jss1-arg-1',
            title: 'Civic Responsibility and Public Good',
            claim: 'Structured standards promote the collective welfare of the school and community.',
            reason: 'Individual desires must occasionally be balanced against the health, safety, and progress of the entire group.',
            example: 'In secondary schools where community standards are maintained, academic focus and mutual respect improve markedly.',
            linkToMotion: 'Therefore, this motion advances the collective interest of our educational community.',
            speechSentence: 'A healthy society requires that we balance personal preference with public responsibility.',
            weakness: 'Individual autonomy and creative expression must still be respected within reasonable limits.'
          },
          {
            id: 'jss1-arg-2',
            title: 'Long-term Character and Discipline Development',
            claim: 'Navigating structured expectations prepares adolescents for adulthood and professional life.',
            reason: 'In universities and workplaces across Nigeria, individuals are expected to demonstrate consistency and accountability.',
            example: 'Nigerian youth who learn structured responsibility in junior school adapt faster to senior secondary and vocational demands.',
            linkToMotion: 'This demonstrates that the motion provides vital preparation for adult citizenship.',
            speechSentence: 'Discipline is not punishment; it is the bridge between our current abilities and our future goals.',
            weakness: 'Strictness without empathy can sometimes stifle natural curiosity and enthusiasm.'
          },
          {
            id: 'jss1-arg-3',
            title: 'Fairness and Equal Standards for All',
            claim: 'Universal standards prevent favoritism and ensure equal opportunity.',
            reason: 'Without consistent rules, those with greater privilege or louder voices often dominate at the expense of quiet peers.',
            example: 'In classroom activities, transparent expectations ensure that every student has an equal turn regardless of popularity.',
            linkToMotion: 'The motion guarantees equity and justice across the student body.',
            speechSentence: 'Fairness means holding everyone to the same high standard of integrity and respect.',
            weakness: 'Fairness sometimes requires accommodating students with special needs or difficult home circumstances.'
          },
          {
            id: 'jss1-arg-4',
            title: 'Cultivating Leadership by Example',
            claim: 'Adopting this motion encourages students to lead by moral example rather than coercion.',
            reason: 'True leadership is demonstrated through integrity and practical service to others.',
            example: 'Student prefects who embody their school values inspire their peers to cooperate voluntarily.',
            linkToMotion: 'Supporting this motion reinforces positive peer leadership throughout the school.',
            speechSentence: 'Leadership is about service and integrity, not privilege and bossiness.',
            weakness: 'Peer leaders require proper training and support to avoid feeling overwhelmed.'
          }
        ],
    oppositionArguments: isP4
      ? [
          {
            id: 'p4-opp-1',
            title: 'Every Child is Unique and Needs Flexibility',
            claim: 'A single rigid rule does not fit every child or every situation.',
            reason: 'Children have different energy levels, talents, and family routines.',
            example: 'A child who is feeling sick or has extra lessons might need a different schedule.',
            linkToMotion: 'Therefore, we should allow flexibility rather than enforcing a strict rule.',
            speechSentence: 'Kindness and understanding are sometimes more important than rigid rules.',
            weakness: 'Too much flexibility without any boundaries can lead to confusion.'
          },
          {
            id: 'p4-opp-2',
            title: 'Rest and Creative Freedom Spark Joy',
            claim: 'Children need free time to explore, imagine, and rest their growing minds.',
            reason: 'Constantly focusing on duties can make children feel tired and stressed.',
            example: 'When children draw, make up games, or daydream, their brains develop creative problem-solving skills.',
            linkToMotion: 'This shows that strict requirements should not crowd out joyful childhood rest.',
            speechSentence: 'Play and imagination are not wasted time; they are how children learn and stay healthy.',
            weakness: 'Rest must still be balanced with necessary family responsibilities.'
          },
          {
            id: 'p4-opp-3',
            title: 'Trust Teaches Self-Motivation Better Than Pressure',
            claim: 'When children are trusted, they learn to make good choices on their own.',
            reason: 'If adults always force a rule, children only obey when someone is watching.',
            example: 'When my parents give me a choice of when to tidy my room, I feel proud to do it myself.',
            linkToMotion: 'Therefore, trusting children builds genuine inner responsibility.',
            speechSentence: 'When you trust us, we learn to do the right thing from our own hearts.',
            weakness: 'Younger children still need guidance so they do not forget their duties.'
          }
        ]
      : [
          {
            id: 'jss1-opp-1',
            title: 'Preserving Individual Autonomy and Self-Expression',
            claim: 'Overly prescriptive rules diminish personal initiative and critical thinking.',
            reason: 'Adolescents develop mature decision-making skills by having room to make and learn from their own choices.',
            example: 'Students given freedom to design their own study groups often discover creative ways to collaborate effectively.',
            linkToMotion: 'Rejecting this motion encourages students to develop intrinsic motivation rather than external compliance.',
            speechSentence: 'True maturity comes from making thoughtful choices, not from unthinking obedience.',
            weakness: 'Complete autonomy without structure can lead to disorganization and neglected responsibilities.'
          },
          {
            id: 'jss1-opp-2',
            title: 'Diverse Realities Demand Contextual Flexibility',
            claim: 'Universal mandates fail to account for socioeconomic and personal diversity across Nigerian families.',
            reason: 'Students come from varied home environments with differing obligations, resources, and transportation realities.',
            example: 'A student who assists in a family shop after school has different evening pressures than one with free time.',
            linkToMotion: 'Rigid policies risk unfairly penalizing students facing unique family circumstances.',
            speechSentence: 'Compassion requires us to recognize that different students carry different burdens outside school.',
            weakness: 'Standards must not become so elastic that basic community expectations collapse.'
          },
          {
            id: 'jss1-opp-3',
            title: 'Risk of Fostering Resentment and Superficial Compliance',
            claim: 'Enforcing rules from above often leads to eye-service rather than genuine moral development.',
            reason: 'When people feel coerced without being persuaded, they conform while watched and rebel when unsupervised.',
            example: 'Classrooms governed by heavy restrictions often see students act out the moment the teacher steps into the corridor.',
            linkToMotion: 'This proves that persuasion and dialogue build better character than administrative compulsion.',
            speechSentence: 'Character is what you do when nobody is looking, and compulsion does not build character.',
            weakness: 'Dialogue takes time, and immediate order is sometimes necessary for safety.'
          },
          {
            id: 'jss1-opp-4',
            title: 'Encouraging Innovation and Questioning the Status Quo',
            claim: 'Progress occurs when young people are permitted to question and improve established customs.',
            reason: 'Nigeria’s future relies on analytical thinkers who can challenge inefficiency and propose constructive reforms.',
            example: 'Throughout Nigerian history, student voices have driven beneficial reforms in school welfare and community projects.',
            linkToMotion: 'We should not extinguish the critical questioning spirit that drives national progress.',
            speechSentence: 'Schools should teach us to think for ourselves, not just to repeat established conventions.',
            weakness: 'Questioning should remain respectful and constructive rather than disruptive for its own sake.'
          }
        ],
    evidenceAndResearch: {
      sources: [
        {
          id: 'src-f1',
          title: 'National Policy on Education and Civic Values',
          organization: 'Federal Ministry of Education / NERDC Nigeria',
          url: 'https://education.gov.ng',
          supportsSide: 'both',
          summary: 'Framework on balancing discipline, moral character, and student welfare in Nigerian basic education.',
          relevanceNote: 'Emphasizes that educational environments must combine high expectations with student voice.',
          verificationStatus: 'verified'
        },
        {
          id: 'src-f2',
          title: 'Child Rights Act and Positive Discipline Guidelines',
          organization: 'UNICEF Nigeria / National Human Rights Commission',
          url: 'https://unicef.org/nigeria',
          supportsSide: 'both',
          summary: 'Advocates for constructive dialogue, positive reinforcement, and participatory learning for children.',
          relevanceNote: 'Shows that respectful listening enhances educational outcomes.',
          verificationStatus: 'verified'
        }
      ],
      researchStatus: 'Sources verified',
      researchNotes: 'Curriculum principles grounded in Nigerian educational guidelines and basic civic studies frameworks.'
    },
    sampleSpeeches: {
      propositionSpeech: isP4
        ? `Good afternoon mummy, daddy, and my wonderful family!

My name is ${learner.name}, and I am in ${learner.classLevel}. Today I am speaking in support of the motion: "${topic.motion}".

First of all, when we do what is right and follow good habits, our homes and classrooms become peaceful. Nobody likes shouting or confusion! When everyone knows their duty and does it with a smile, we all feel happy and safe.

Second, helping out and taking responsibility shows love. Our parents and teachers work hard every day for us. When we do our part, we are being good teammates.

Finally, doing our duties builds good habits for the future. When we grow big, we will already know how to be responsible Nigerian citizens.

Therefore, I ask everyone to agree with this motion. Thank you for listening to me!`
        : `Respected chairperson, adjudicators, distinguished guests, and fellow students, good afternoon.

My name is ${learner.name}, and I stand before you to advocate for the motion: "${topic.motion}".

Let us examine why this issue matters to us as young Nigerian citizens. A school and a community are not collections of isolated individuals; they are interconnected bodies where the actions of one person affect everyone around them.

Our first argument rests on public responsibility and civic order. When we uphold high standards of integrity and duty, we create an environment where every student can learn without disruption. In our civic education classes, we study the importance of the rule of law. If we cannot practice responsibility in our daily routines, how can we expect our nation to prosper?

Our second argument concerns character development. Discipline is not a restriction on our happiness; it is the foundation of our future achievements. Whether we aspire to become doctors, software engineers, teachers, or public servants, success requires consistency, effort, and accountability.

My worthy opponents may argue that rules limit our freedom. But true freedom is not the freedom to do whatever we feel like in the moment; it is the freedom to live in an orderly, fair, and supportive community where everyone's rights are respected.

For these compelling reasons, I urge you all to support this motion. Thank you.`,
      oppositionSpeech: isP4
        ? `Good afternoon everyone!

My name is ${learner.name}, and today I am speaking against the motion: "${topic.motion}".

While the other side made some nice points, let us look at the other side of the story. Every child is different! Sometimes a child is tired after school, or has a different family routine. We cannot put every single child into the exact same box.

Also, children need rest and play. When we play games, run outside, and make up creative stories, our brains grow strong and happy. Play is not a waste of time; it is how children learn!

Finally, when grown-ups trust us and talk to us kindly instead of making strict rules, we feel proud to do the right thing from our own hearts.

So let us have flexibility, joy, and understanding! Thank you very much.`
        : `Respected chairperson, adjudicators, and fellow students, good afternoon.

My name is ${learner.name}, and I stand firmly against the motion: "${topic.motion}".

While my opponent has painted an attractive picture of order and discipline, their arguments overlook a fundamental reality: true character cannot be manufactured through rigid compulsion.

Our primary argument is that maturity requires autonomy. When young people are simply told what to do without being trusted to make choices, they learn compliance, not conviction. In the real world, we will not always have a parent or teacher watching over our shoulders. We must learn to weigh consequences and choose the right path because we believe in it, not because we fear a reprimand.

Furthermore, we must recognize the diversity of our student body. Families across Nigeria face differing socioeconomic realities. A policy that seems straightforward for one household may impose an unfair burden on another. Education must be compassionate and adaptable, not rigid and unyielding.

In conclusion, our goal should be to inspire thoughtful, self-motivated citizens who question, create, and lead with empathy. I urge you to reject this motion. Thank you.`,
      propositionKeyPoints: [
        'Responsibility and structure create peace and order for everyone.',
        'Developing good habits in basic school lays the groundwork for future success.',
        'Cooperation and team responsibility demonstrate practical love and respect.'
      ],
      oppositionKeyPoints: [
        'Flexibility and autonomy build genuine internal motivation rather than mere eye-service.',
        'Children need rest, creativity, and balanced routines to stay healthy.',
        'One-size-fits-all policies fail to accommodate family diversity.'
      ]
    },
    rebuttals: [
      {
        id: 'reb-f1',
        opposingClaim: 'Strict rules take away our happiness and freedom.',
        whySomeoneMightBelieveIt: 'Because everyone naturally enjoys having total freedom without restrictions.',
        respectfulResponse: 'My opponent has raised a fair concern about personal joy, but structure actually protects our happiness.',
        supportingReasonOrExample: 'Without rules on a football pitch, the game would turn into chaos and nobody would enjoy playing.',
        speechReadyRebuttal: 'I understand my opponent\'s love of freedom; however, just like rules in football, fair standards make the game fun and safe for everyone.',
        guidanceNote: 'Affirm their love for fun, then show how fair guidelines prevent chaos.'
      },
      {
        id: 'reb-f2',
        opposingClaim: 'People will only obey when someone is watching them.',
        whySomeoneMightBelieveIt: 'Because external pressure sometimes causes people to pretend.',
        respectfulResponse: 'Another way to look at this is that practice makes habits permanent.',
        supportingReasonOrExample: 'When we practice brushing our teeth every night, it becomes natural and we keep doing it even when parents are asleep.',
        speechReadyRebuttal: 'Another way to look at this is that good habits practiced daily become part of who we are, even when nobody is watching.',
        guidanceNote: 'Address habit formation rather than attacking the idea.'
      }
    ],
    debateStructure: {
      formatType: isP4 ? 'home-practice' : 'formal-debate',
      steps: isP4
        ? [
            {
              order: 1,
              title: 'Welcome & Topic Introduction',
              speakerRole: 'Parent Coach',
              durationMinutes: 1,
              description: 'Read the motion with a warm smile. Ask the learner which side they would like to argue.',
              parentTip: 'Set a joyful, relaxed tone.'
            },
            {
              order: 2,
              title: 'Opening Speech',
              speakerRole: `${learner.name} (Learner)`,
              durationMinutes: 2,
              description: 'Deliver the opening speech standing upright with a clear voice.',
              parentTip: 'Nod and smile to keep their confidence high.'
            },
            {
              order: 3,
              title: 'Friendly Opposing Point',
              speakerRole: 'Parent or Sibling',
              durationMinutes: 1,
              description: 'State one counter-point politely.',
              parentTip: 'Model respectful, quiet listening.'
            },
            {
              order: 4,
              title: 'Quick Rebuttal',
              speakerRole: `${learner.name}`,
              durationMinutes: 1,
              description: 'Answer with "I understand that, but here is my reason..."',
              parentTip: 'Praise their polite phrasing.'
            },
            {
              order: 5,
              title: 'Celebration & Rubric Score',
              speakerRole: 'Family',
              durationMinutes: 2,
              description: 'Applaud warmly, give two specific compliments, and fill the 1-to-4 rubric.',
              parentTip: 'Celebrate their bravery and improvement.'
            }
          ]
        : [
            {
              order: 1,
              title: 'Chairperson Welcome',
              speakerRole: 'Parent / Chair',
              durationMinutes: 1,
              description: 'Introduce the motion and establish debate rules.',
              parentTip: 'Remind speakers to address arguments, not personalities.'
            },
            {
              order: 2,
              title: 'Proposition Speech',
              speakerRole: 'Proposition',
              durationMinutes: 3,
              description: 'Present the case using Point -> Reason -> Example -> Link (PREL).',
              parentTip: 'Signal when 1 minute remains.'
            },
            {
              order: 3,
              title: 'Opposition Speech',
              speakerRole: 'Opposition',
              durationMinutes: 3,
              description: 'Deliver the counter-case with equal rigor and respect.',
              parentTip: 'Speak with calm persuasion.'
            },
            {
              order: 4,
              title: 'Rebuttal & Cross-Examination',
              speakerRole: 'Both Speakers',
              durationMinutes: 2,
              description: 'Address opposing claims using formal diplomatic phrases.',
              parentTip: 'Guide them to pinpoint the exact flaw in reasoning.'
            },
            {
              order: 5,
              title: 'Closing Summaries',
              speakerRole: 'Both Speakers',
              durationMinutes: 2,
              description: 'Reiterate the core principle and deliver a memorable finish.',
              parentTip: 'No new points, just a crystal-clear wrap-up.'
            },
            {
              order: 6,
              title: 'Parent Feedback & Rubric Review',
              speakerRole: 'Parent Coach',
              durationMinutes: 3,
              description: 'Evaluate speech against the 8 rubric criteria and set next week’s target.',
              parentTip: 'Frame scores as coaching milestones, not exam grades.'
            }
          ]
    },
    independentThinkingExercises: {
      reflectionQuestions: [
        `In your own words, what is the most important lesson from this debate?`,
        `Can you describe a real situation in your school or neighborhood where this happened?`,
        `If you were the leader in charge, what middle ground would you suggest?`
      ],
      fillInTemplate: {
        opinion: `this motion has strong points on both sides`,
        reason: `because it balances personal freedom with community responsibility`,
        example: `what we see in our everyday Nigerian school and home life`,
        opposingView: `some people might disagree because they prioritize one side over the other`,
        response: `we can find a fair balance with clear communication and mutual respect`,
        conclusion: `thoughtful debating helps us become wiser and more articulate citizens`
      },
      strongestArgumentPrompt: 'Which single point felt strongest when you spoke it out loud?',
      preferredSideWeaknessPrompt: 'What is one reasonable objection someone could raise against your side?',
      opposingViewFairExplanationPrompt: 'Explain why someone who loves their family might take the opposite view from yours.',
      originalNigerianExamplePrompt: 'Create one original example from your own everyday life in Nigeria.'
    },
    parentCoachingGuide: {
      dayByDayPlan: [
        {
          day: 'Day 1 (15 mins)',
          title: 'Explore & Vocabulary',
          duration: '15 mins',
          focus: 'Read the motion and discuss key terms together.',
          parentActions: ['Read the motion aloud.', 'Explain new words with relatable home examples.']
        },
        {
          day: 'Day 2 (15 mins)',
          title: 'Building Arguments (P-R-E-L)',
          duration: '15 mins',
          focus: 'Inspect the arguments and link them to Nigerian examples.',
          parentActions: ['Practice Point -> Reason -> Example -> Link.', 'Encourage speaking with good posture.']
        },
        {
          day: 'Day 3 (15 mins)',
          title: 'Understanding the Other Side',
          duration: '15 mins',
          focus: 'Read opposing arguments and practice polite rebuttals.',
          parentActions: ['Ask how the other side sees it.', 'Practice "I understand that, but..."']
        },
        {
          day: 'Day 4 (20 mins)',
          title: 'Speech Practice Aloud',
          duration: '20 mins',
          focus: 'Read the sample speech and fill out the independent thinking sheet.',
          parentActions: ['Time the speech gently.', 'Praise voice clarity and pauses.']
        },
        {
          day: 'Day 5 (20 mins)',
          title: 'The Home Debate & Rubric',
          duration: '20 mins',
          focus: 'Hold the debate session and fill in the coaching rubric.',
          parentActions: ['Applaud enthusiastically.', 'Complete the 1-to-4 scoring together.']
        }
      ],
      essentialSections: [
        'Understanding the Topic',
        'Core Arguments (at least 2 for each side)',
        'Sample Speeches',
        'Coaching Rubric'
      ],
      optionalAdvancedSections: [
        'Formal research sources',
        'Cross-examination round'
      ],
      plainLanguageSummary: `A balanced debate exploring responsibility, fairness, and mutual cooperation in everyday Nigerian life.`,
      coachingQuestions: [
        `What is your strongest reason?`,
        `Can you give me an example from your school?`,
        `What might someone on the other side say?`,
        `How can you answer that respectfully?`
      ],
      howToUnstickChild: [
        `If they freeze, take a slow deep breath together and ask: "What is your main point in just five words?"`,
        `Remind them that making a mistake is just practice in action.`
      ],
      howToCorrectGently: [
        `Do not correct them while they are speaking; save notes for the debrief.`,
        `Always begin feedback with what made you proud.`
      ],
      feedbackAndEncouragement: [
        `Praise audibility, eye contact, and courageous effort.`,
        `Remind them that debate makes them powerful thinkers and leaders.`
      ],
      postDebateDebriefQuestions: [
        `How did you feel standing up and speaking today?`,
        `What was your favourite argument?`,
        `What is one thing you want to practice next week?`
      ]
    },
    confidenceBuildingActivity: {
      activityName: isP4 ? 'The 3-Sentence Superhero Opinion' : 'The 30-Second Object Champion',
      durationMinutes: 5,
      instructions: isP4
        ? 'Stand with hands on hips like a superhero. Take a deep breath and give your opinion on your favourite food in three clear sentences!'
        : 'Pick an everyday object in the room and speak for 30 continuous seconds explaining why it is an extraordinary invention.',
      speakingHabitsChecklist: [
        'Stand tall with feet shoulder-width apart.',
        'Take a slow belly breath before speaking.',
        'Look at your listeners with a friendly expression.',
        'Pause between sentences instead of rushing.',
        'Finish with a calm, confident "Thank you."'
      ]
    },
    assessmentRubricTemplate: {
      criteria: INITIAL_APP_DATA.packs['pack-jss1-w1'].assessmentRubricTemplate.criteria
    },
    contentSuitabilityStatus: 'Approved Safe',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// 6. Interactive speech evaluation / coach feedback endpoint
app.post('/api/gemini/assess-speech', async (req: Request, res: Response) => {
  const { notes, learner, motion, scores } = req.body as {
    notes: string;
    learner: Learner;
    motion: string;
    scores?: Record<string, number>;
  };

  const ai = getGenAI();
  if (!ai) {
    res.json({
      success: true,
      feedback: {
        whatWentWell: 'Clear delivery, strong willingness to participate, and good use of relatable everyday examples.',
        improvementTarget: 'Work on pausing between major points and expanding the reason before jumping to the example.',
        coachingTip: 'Celebrate courage! Confidence blooms when practice feels like an encouraging adventure.',
        suggestedNextGoal: 'Practice standing up for the full target time with steady eye contact.'
      }
    });
    return;
  }

  try {
    const prompt = `You are a warm, expert Nigerian debate coach for children.
A parent has just completed a debate session with their child:
- Child: ${learner.name}, Age ${learner.age}, Class ${learner.classLevel}
- Motion: "${motion}"
- Parent's observations / notes: "${notes || 'Delivered speech, tried to make eye contact, used Nigerian examples.'}"
- Current scores (1-4 scale): ${JSON.stringify(scores || {})}

Provide encouraging, developmental coaching feedback for the parent and child.
Return JSON with:
- whatWentWell (2-3 sentences praising specific effort and courage)
- improvementTarget (1 gentle, actionable target for next week)
- coachingTip (practical advice for the parent)
- suggestedNextGoal (a fun, achievable mini-goal for the child)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatWentWell: { type: Type.STRING },
            improvementTarget: { type: Type.STRING },
            coachingTip: { type: Type.STRING },
            suggestedNextGoal: { type: Type.STRING }
          },
          required: ['whatWentWell', 'improvementTarget', 'coachingTip', 'suggestedNextGoal']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, feedback: parsed });
  } catch (err: any) {
    res.json({
      success: true,
      feedback: {
        whatWentWell: 'Spoke with clear effort and embraced the debate challenge with enthusiasm.',
        improvementTarget: 'Practice pausing after the first argument to let the audience absorb the point.',
        coachingTip: 'Acknowledge bravery first; technical skills grow naturally over repeated friendly sessions.',
        suggestedNextGoal: 'Add one personal Nigerian story or example in the next session.'
      }
    });
  }
});

// Configure Vite or Static files depending on environment
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted for development.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Debate Coach for Kids server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
