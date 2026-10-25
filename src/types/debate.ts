/**
 * Debate Coach for Kids - Data Models & Types
 * Age-differentiated Nigerian civic debate application
 */

export type ClassLevel = 'JSS 1' | 'Primary 4' | string;

export type TopicCategory =
  | 'Honesty, integrity, and moral responsibility'
  | 'Family, friendship, and personal responsibility'
  | 'School rules, discipline, and learning'
  | 'Leadership and good governance'
  | 'Citizenship, community service, and public responsibility'
  | 'Fairness, justice, equality, and inclusion'
  | 'Environmental protection and public cleanliness'
  | 'Technology, artificial intelligence, and responsible digital behaviour'
  | 'Teamwork, competition, and cooperation'
  | 'Money, needs, wants, saving, and responsible choices'
  | 'Health, safety, and everyday decision-making'
  | 'Nigerian culture, community development, and national responsibility';

export const TOPIC_CATEGORIES: TopicCategory[] = [
  'Honesty, integrity, and moral responsibility',
  'Family, friendship, and personal responsibility',
  'School rules, discipline, and learning',
  'Leadership and good governance',
  'Citizenship, community service, and public responsibility',
  'Fairness, justice, equality, and inclusion',
  'Environmental protection and public cleanliness',
  'Technology, artificial intelligence, and responsible digital behaviour',
  'Teamwork, competition, and cooperation',
  'Money, needs, wants, saving, and responsible choices',
  'Health, safety, and everyday decision-making',
  'Nigerian culture, community development, and national responsibility'
];

export interface LearningStageInfo {
  stage: number;
  name: string;
  description: string;
  focus: string;
}

export const LEARNING_STAGES: LearningStageInfo[] = [
  {
    stage: 1,
    name: 'Expressing an opinion',
    description: 'Recognising an issue, stating a position, and giving a simple reason.',
    focus: 'Confidence and vocabulary'
  },
  {
    stage: 2,
    name: 'Supporting an argument',
    description: 'Connecting claims to reasons and concrete everyday examples.',
    focus: 'Reasoning and evidence'
  },
  {
    stage: 3,
    name: 'Understanding opposing views',
    description: 'Listening carefully, identifying a different viewpoint, and responding respectfully.',
    focus: 'Empathy and rebuttal'
  },
  {
    stage: 4,
    name: 'Building stronger arguments',
    description: 'Comparing reasons, evaluating evidence, identifying weaknesses, and responding to counterarguments.',
    focus: 'Analytical debate structure'
  },
  {
    stage: 5,
    name: 'Independent debate',
    description: 'Constructing original speeches, adapting arguments, and reflecting on performance.',
    focus: 'Mastery and self-reflection'
  }
];

export interface Learner {
  id: string;
  name: string;
  age: number;
  classLevel: ClassLevel;
  currentStage: number;
  confidenceLevel: 'Beginning' | 'Developing' | 'Good progress' | 'High confidence';
  speakingSkillLevel: string;
  preferredDuration: string;
  preferredVocabulary: string;
  areasForImprovement: string;
  targetGoal: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebateArgument {
  id: string;
  title: string;
  claim: string;           // Point
  reason: string;          // Reason
  example: string;         // Example / Evidence with Nigerian context
  linkToMotion: string;    // Link to the motion
  speechSentence: string;  // Speech-ready natural sentence
  weakness: string;        // Critical thinking limitation or counter-angle
}

export interface ResearchSource {
  id: string;
  title: string;
  organization: string;    // e.g. NERDC, UBEC, Federal Ministry of Education, NBS Nigeria
  url: string;
  publicationDate?: string;
  accessedDate?: string;
  supportsSide: 'proposition' | 'opposition' | 'both';
  summary: string;
  relevanceNote: string;
  verificationStatus: 'verified' | 'partially-verified' | 'general-knowledge';
}

export interface RebuttalItem {
  id: string;
  opposingClaim: string;
  whySomeoneMightBelieveIt: string;
  respectfulResponse: string;
  supportingReasonOrExample: string;
  speechReadyRebuttal: string;
  guidanceNote: string;
}

export interface DebateSequenceStep {
  order: number;
  title: string;
  speakerRole: string;
  durationMinutes: number;
  description: string;
  parentTip: string;
}

export interface IndependentThinkingExercises {
  reflectionQuestions: string[];
  fillInTemplate: {
    opinion: string;
    reason: string;
    example: string;
    opposingView: string;
    response: string;
    conclusion: string;
  };
  strongestArgumentPrompt: string;
  preferredSideWeaknessPrompt: string;
  opposingViewFairExplanationPrompt: string;
  originalNigerianExamplePrompt: string;
}

export interface DayCoachingPlan {
  day: string;
  title: string;
  duration: string;
  focus: string;
  parentActions: string[];
}

export interface ParentCoachingGuide {
  dayByDayPlan: DayCoachingPlan[];
  essentialSections: string[];
  optionalAdvancedSections: string[];
  plainLanguageSummary: string;
  coachingQuestions: string[];
  howToUnstickChild: string[];
  howToCorrectGently: string[];
  feedbackAndEncouragement: string[];
  postDebateDebriefQuestions: string[];
}

export interface ConfidenceBuildingActivity {
  activityName: string;
  durationMinutes: number;
  instructions: string;
  speakingHabitsChecklist: string[];
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  level1: string; // Beginning
  level2: string; // Developing
  level3: string; // Good progress
  level4: string; // Strong performance
}

export interface DebatePack {
  id: string;
  topicId: string;
  learnerId: string;
  learnerName: string;
  learnerAge: number;
  learnerClass: string;
  title: string;
  motion: string;
  category: TopicCategory;
  difficulty: 'Beginning' | 'Intermediate' | 'Advanced';
  weekNumber: number;
  estimatedPrepTimeMinutes: number;
  recommendedSpeakingMinutes: string;
  learningObjectives: string[];
  understandingTheTopic: {
    simpleMeaning: string;
    keyVocabulary: { word: string; definition: string; childFriendlyExample: string }[];
    realWorldIssue: string;
    whyItMatters: string;
    familiarNigerianExample: string;
    reflectionQuestions: string[];
  };
  backgroundAndContext: {
    contextSummary: string;
    civicConnection: string;
    distinguishingFactsFromOpinions: string[];
  };
  propositionArguments: DebateArgument[];
  oppositionArguments: DebateArgument[];
  evidenceAndResearch: {
    sources: ResearchSource[];
    researchStatus: 'Sources verified' | 'Partially verified' | 'Research not performed / General Knowledge';
    researchNotes: string;
  };
  sampleSpeeches: {
    propositionSpeech: string;
    oppositionSpeech: string;
    propositionKeyPoints: string[];
    oppositionKeyPoints: string[];
  };
  rebuttals: RebuttalItem[];
  debateStructure: {
    formatType: 'home-practice' | 'formal-debate';
    steps: DebateSequenceStep[];
  };
  independentThinkingExercises: IndependentThinkingExercises;
  parentCoachingGuide: ParentCoachingGuide;
  confidenceBuildingActivity: ConfidenceBuildingActivity;
  assessmentRubricTemplate: {
    criteria: RubricCriterion[];
  };
  contentSuitabilityStatus: 'Approved Safe' | 'Needs Review';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface DebateTopic {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerClass: string;
  title: string;
  motion: string;
  category: TopicCategory;
  difficulty: 'Beginning' | 'Intermediate' | 'Advanced';
  weekNumber: number;
  scheduledDate: string;
  approvalStatus: 'Pending' | 'Accepted' | 'Rejected';
  completionStatus: 'Not generated' | 'Draft' | 'Ready for practice' | 'Completed';
  suitabilityNotes?: string;
  packId?: string;
  createdAt: string;
}

export interface SessionAssessment {
  id: string;
  learnerId: string;
  learnerName: string;
  topicId: string;
  packId: string;
  topicTitle: string;
  motion: string;
  date: string;
  scores: Record<string, number>; // criterionId -> score (1-4)
  totalScore: number;
  maxScore: number;
  whatChildDidWell: string;
  oneImprovementTarget: string;
  parentComments: string;
  childReflection: string;
  nextPracticeGoal: string;
  createdAt: string;
}

export interface AppStoreData {
  learners: Learner[];
  topics: DebateTopic[];
  packs: Record<string, DebatePack>; // packId -> DebatePack
  assessments: SessionAssessment[];
  currentWeekNumber: number;
  preferredDebateDay: string;
}
