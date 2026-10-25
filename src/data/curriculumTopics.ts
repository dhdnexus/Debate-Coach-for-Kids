/**
 * Curriculum Framework: 12 Categories and Curated Motions for Nigerian Learners
 * Differentiated for Primary 4 (8 years) and JSS 1 (10 years)
 */

import { TopicCategory } from '../types/debate';

export interface CurriculumTopicIdea {
  id: string;
  category: TopicCategory;
  motion: string;
  title: string;
  targetClass: 'Primary 4' | 'JSS 1' | 'Both';
  recommendedStage: number;
  difficulty: 'Beginning' | 'Intermediate' | 'Advanced';
  pedagogicalRationale: string;
  nigerianContextNote: string;
}

export const CURRICULUM_BANK: CurriculumTopicIdea[] = [
  // 1. Honesty, integrity, and moral responsibility
  {
    id: 'cur-hon-1',
    category: 'Honesty, integrity, and moral responsibility',
    motion: 'This house believes that telling the truth is always better, even when it gets you or your friend into trouble.',
    title: 'Truth-Telling and Friendship Loyalty',
    targetClass: 'Primary 4',
    recommendedStage: 2,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Helps young learners weigh honesty against peer loyalty.',
    nigerianContextNote: 'Classroom scenarios like broken rulers or spilled water.'
  },
  {
    id: 'cur-hon-2',
    category: 'Honesty, integrity, and moral responsibility',
    motion: 'This house believes that schools should reward students for honesty and integrity more than for scoring high examination marks.',
    title: 'Rewarding Character vs Academic Marks',
    targetClass: 'JSS 1',
    recommendedStage: 4,
    difficulty: 'Intermediate',
    pedagogicalRationale: 'Critiques the examination-focused culture and examines how integrity underpins national development.',
    nigerianContextNote: 'Reflects on examination malpractice and moral education in Nigerian schools.'
  },

  // 2. Family, friendship, and personal responsibility
  {
    id: 'cur-fam-1',
    category: 'Family, friendship, and personal responsibility',
    motion: 'This house believes that children should finish their household chores before playing with toys or screens.',
    title: 'Chores Before Playtime for Children',
    targetClass: 'Primary 4',
    recommendedStage: 2,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Teaches work-life balance and family cooperation.',
    nigerianContextNote: 'Everyday Nigerian Saturday cleaning and kitchen chores.'
  },
  {
    id: 'cur-fam-2',
    category: 'Family, friendship, and personal responsibility',
    motion: 'This house believes that older siblings should not be held responsible for the mistakes or misbehavior of their younger brothers and sisters.',
    title: 'Sibling Responsibility and Accountability',
    targetClass: 'JSS 1',
    recommendedStage: 3,
    difficulty: 'Intermediate',
    pedagogicalRationale: 'Examines familial hierarchy, justice, and fair distribution of parental responsibility.',
    nigerianContextNote: 'In Nigerian culture, older siblings often carry heavy babysitting duties.'
  },

  // 3. School rules, discipline, and learning
  {
    id: 'cur-sch-1',
    category: 'School rules, discipline, and learning',
    motion: 'This house believes that primary school pupils should not be given homework on weekends.',
    title: 'No Weekend Homework for Primary Pupils',
    targetClass: 'Primary 4',
    recommendedStage: 1,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Helps children express their personal routine and evaluate rest versus study.',
    nigerianContextNote: 'Balancing weekend lessons, church/mosque activities, and family chores.'
  },
  {
    id: 'cur-sch-2',
    category: 'School rules, discipline, and learning',
    motion: 'This house believes that Nigerian secondary schools should dedicate more weekly hours to practical trade and computer skills than to preparing for written examinations.',
    title: 'Practical Vocational Skills vs Academic Exams',
    targetClass: 'JSS 1',
    recommendedStage: 4,
    difficulty: 'Intermediate',
    pedagogicalRationale: 'Explores real-world employability, national curriculum goals, and trade entrepreneurship.',
    nigerianContextNote: 'Focuses on 6-3-3-4 curriculum vocational goals (ICT, tailoring, electrical works).'
  },

  // 4. Leadership and good governance
  {
    id: 'cur-lead-1',
    category: 'Leadership and good governance',
    motion: 'This house believes that school prefects should be elected by fellow students rather than appointed by teachers.',
    title: 'Democratic Prefect Elections in Schools',
    targetClass: 'JSS 1',
    recommendedStage: 4,
    difficulty: 'Intermediate',
    pedagogicalRationale: 'Introduces institutional appointment vs democratic mandate.',
    nigerianContextNote: 'Prefect selection tradition in Nigerian secondary schools.'
  },
  {
    id: 'cur-lead-2',
    category: 'Leadership and good governance',
    motion: 'This house believes that good leadership is shown more by being kind and listening than by being strict and punishing.',
    title: 'Kind Leadership vs Strict Leadership',
    targetClass: 'Primary 4',
    recommendedStage: 2,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Encourages young minds to re-evaluate authority as empathy and service.',
    nigerianContextNote: 'Class monitors, queue leaders, and group captains in primary school.'
  },

  // 5. Citizenship, community service, and public responsibility
  {
    id: 'cur-cit-1',
    category: 'Citizenship, community service, and public responsibility',
    motion: 'This house believes that every Nigerian secondary school student should be required to complete 20 hours of community service before graduating.',
    title: 'Compulsory Community Service for Students',
    targetClass: 'JSS 1',
    recommendedStage: 4,
    difficulty: 'Intermediate',
    pedagogicalRationale: 'Develops civic duty, empathy for vulnerable citizens, and community development.',
    nigerianContextNote: 'Clean-up drives, reading to younger pupils, hospital visits, and NYSC preparation.'
  },
  {
    id: 'cur-cit-2',
    category: 'Citizenship, community service, and public responsibility',
    motion: 'This house believes that children should help clean up the neighborhood playground even if they did not drop the litter.',
    title: 'Caring for Shared Playgrounds',
    targetClass: 'Primary 4',
    recommendedStage: 2,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Teaches collective responsibility over selfish indifference.',
    nigerianContextNote: 'Cleaning communal spaces in residential estates or village squares.'
  },

  // 6. Fairness, justice, equality, and inclusion
  {
    id: 'cur-fair-1',
    category: 'Fairness, justice, equality, and inclusion',
    motion: 'This house believes that girls and boys should have equal turns to play football on the main school field.',
    title: 'Equal Play Pitch Access for Boys and Girls',
    targetClass: 'Primary 4',
    recommendedStage: 2,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Promotes gender fairness and shared playground rights in a concrete manner.',
    nigerianContextNote: 'Nigerian primary school sports fields often monopolized by older boys.'
  },
  {
    id: 'cur-fair-2',
    category: 'Fairness, justice, equality, and inclusion',
    motion: 'This house believes that children with physical disabilities should attend regular neighbourhood schools rather than special separated schools.',
    title: 'Inclusive Education in Nigerian Basic Schools',
    targetClass: 'JSS 1',
    recommendedStage: 4,
    difficulty: 'Advanced',
    pedagogicalRationale: 'Promotes empathy, universal design, and dismantles social stigmatization.',
    nigerianContextNote: 'UBEC inclusive education policy and accessibility ramps in public schools.'
  },

  // 7. Environmental protection and public cleanliness
  {
    id: 'cur-env-1',
    category: 'Environmental protection and public cleanliness',
    motion: 'This house believes that single-use plastic water sachets ("pure water" bags) should be completely banned in school premises.',
    title: 'Banning Pure Water Sachets in Schools',
    targetClass: 'JSS 1',
    recommendedStage: 4,
    difficulty: 'Intermediate',
    pedagogicalRationale: 'Weighs environmental pollution and blocked drainage against cheap hydration access.',
    nigerianContextNote: 'Plastic sachet waste clogging gutters and causing flash floods across Nigerian cities.'
  },
  {
    id: 'cur-env-2',
    category: 'Environmental protection and public cleanliness',
    motion: 'This house believes that every family should plant at least one tree or flower pot outside their home.',
    title: 'Greening Our Homes with Trees and Plants',
    targetClass: 'Primary 4',
    recommendedStage: 1,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Builds love for nature and shows how small acts help the planet.',
    nigerianContextNote: 'Shade trees against Nigerian heat, fruit trees (mango, guava), and neighborhood beauty.'
  },

  // 8. Technology, artificial intelligence, and responsible digital behaviour
  {
    id: 'cur-tech-1',
    category: 'Technology, artificial intelligence, and responsible digital behaviour',
    motion: 'This house believes that children under the age of 12 should not own their own personal smartphones.',
    title: 'Smartphone Age Limits for Children',
    targetClass: 'Primary 4',
    recommendedStage: 3,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Encourages children to debate screen time, online safety, and face-to-face friendship.',
    nigerianContextNote: 'Parental device sharing vs personal smartphones during holidays.'
  },
  {
    id: 'cur-tech-2',
    category: 'Technology, artificial intelligence, and responsible digital behaviour',
    motion: 'This house believes that using Artificial Intelligence to write school essays does more harm to a student’s learning than good.',
    title: 'AI Tools in Schoolwork: Helper or Harm?',
    targetClass: 'JSS 1',
    recommendedStage: 4,
    difficulty: 'Intermediate',
    pedagogicalRationale: 'Engages with modern AI literacy, intellectual curiosity, and academic integrity.',
    nigerianContextNote: 'Computer studies classes, online homework aids, and original thinking.'
  },

  // 9. Teamwork, competition, and cooperation
  {
    id: 'cur-team-1',
    category: 'Teamwork, competition, and cooperation',
    motion: 'This house believes that group projects teach us more than studying alone for a test.',
    title: 'Group Projects vs Individual Study',
    targetClass: 'Primary 4',
    recommendedStage: 2,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Teaches social cooperation, conflict resolution, and peer learning.',
    nigerianContextNote: 'Group assignments in basic science and social studies.'
  },
  {
    id: 'cur-team-2',
    category: 'Teamwork, competition, and cooperation',
    motion: 'This house believes that inter-house sports competitions should award trophies for best team spirit rather than only for the highest number of medals.',
    title: 'Sportsmanship Trophies vs Medal Counts',
    targetClass: 'JSS 1',
    recommendedStage: 3,
    difficulty: 'Intermediate',
    pedagogicalRationale: 'Reframes competition from winning at all costs to mutual respect and fair play.',
    nigerianContextNote: 'The massive cultural event of annual Inter-House Sports in Nigerian schools.'
  },

  // 10. Money, needs, wants, saving, and responsible choices
  {
    id: 'cur-mon-1',
    category: 'Money, needs, wants, saving, and responsible choices',
    motion: 'This house believes that children should save half of any gift money they receive in a piggy bank (kolo) rather than spending it on snacks.',
    title: 'Saving in a Kolo vs Buying Treats',
    targetClass: 'Primary 4',
    recommendedStage: 2,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Introduces delayed gratification, needs vs wants, and basic financial literacy.',
    nigerianContextNote: 'Traditional wooden/clay piggy banks (kolo) and festive holiday gift money.'
  },
  {
    id: 'cur-mon-2',
    category: 'Money, needs, wants, saving, and responsible choices',
    motion: 'This house believes that local governments should spend public funds on building free public libraries before fixing recreational sports parks.',
    title: 'Public Budget Priorities: Libraries vs Parks',
    targetClass: 'JSS 1',
    recommendedStage: 4,
    difficulty: 'Intermediate',
    pedagogicalRationale: 'Teaches civic budget prioritization, public goods, and social welfare analysis.',
    nigerianContextNote: 'Local Government Area (LGA) budgets and community youth development.'
  },

  // 11. Health, safety, and everyday decision-making
  {
    id: 'cur-hlth-1',
    category: 'Health, safety, and everyday decision-making',
    motion: 'This house believes that primary schools should ban the sale of fizzy sugary drinks and sweets in school tuck shops.',
    title: 'Healthier Tuck Shops in Primary Schools',
    targetClass: 'Primary 4',
    recommendedStage: 2,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Encourages children to think about dental health, nutrition, and personal discipline.',
    nigerianContextNote: 'School vendors selling soft drinks and biscuits at break time.'
  },
  {
    id: 'cur-hlth-2',
    category: 'Health, safety, and everyday decision-making',
    motion: 'This house believes that parents should respect their teenage children’s privacy by not reading their personal diaries or chat messages without permission.',
    title: 'Privacy and Parental Supervision for Young Adolescents',
    targetClass: 'JSS 1',
    recommendedStage: 4,
    difficulty: 'Advanced',
    pedagogicalRationale: 'Examines safety vs trust, adolescent autonomy, and family communication.',
    nigerianContextNote: 'Parenting traditions in Nigerian families navigating digital communication.'
  },

  // 12. Nigerian culture, community development, and national responsibility
  {
    id: 'cur-cult-1',
    category: 'Nigerian culture, community development, and national responsibility',
    motion: 'This house believes that primary school pupils should be allowed to wear traditional Nigerian clothes to school every Friday instead of uniform.',
    title: 'Traditional Cultural Attire on Fridays in Schools',
    targetClass: 'Primary 4',
    recommendedStage: 2,
    difficulty: 'Beginning',
    pedagogicalRationale: 'Celebrates cultural heritage, indigenous textiles, and national identity.',
    nigerianContextNote: 'Ankara, Aso-Oke, Isiagu, Dashiki wear in cultural days and schools.'
  },
  {
    id: 'cur-cult-2',
    category: 'Nigerian culture, community development, and national responsibility',
    motion: 'This house believes that every Nigerian child should be required to learn at least one Nigerian indigenous language in school in addition to English.',
    title: 'Compulsory Indigenous Language Education in Basic Schools',
    targetClass: 'JSS 1',
    recommendedStage: 4,
    difficulty: 'Intermediate',
    pedagogicalRationale: 'Examines linguistic preservation, unity in diversity, and educational cognitive benefits.',
    nigerianContextNote: 'Yoruba, Hausa, Igbo, Edo, Efik languages under the National Language Policy.'
  }
];
