import { pick } from '../utils/reading';
export type Challenge = {
  id: string;
  category: string;
  title: string;
  difficulty: string;
  estimate: string;
  seconds?: number;
  packs: string[];
};
export const categories = [
  'Pages',
  'Time',
  'Genre',
  'Book Choice',
  'Experience',
  'Weekend',
];
const make = (
  category: string,
  titles: string[],
  packs: string[],
  minutes?: number[],
): Challenge[] =>
  titles.map((title, i) => {
    const timeMatch = title.match(/(\d+)[ -]minutes?/);
    const duration =
      minutes?.[i] ??
      (timeMatch
        ? Number(timeMatch[1])
        : title.includes('one hour')
        ? 60
        : undefined);
    const pageMatch = title.match(/(\d+) pages/);
    const pages = pageMatch ? Number(pageMatch[1]) : undefined;
    return {
      id: `${category}-${i}`,
      category,
      title,
      difficulty:
        (duration && duration >= 30) || (pages && pages >= 30)
          ? 'Medium'
          : 'Easy',
      estimate: duration
        ? `${duration} min`
        : pages
        ? `Est. ${Math.round(pages * 1.2)}–${Math.round(pages * 1.7)} min`
        : 'At your pace',
      seconds: duration ? duration * 60 : undefined,
      packs,
    };
  });
export const challenges: Challenge[] = [
  ...make(
    'Pages',
    [
      'Read 10 pages of your current book',
      'Read 20 pages tonight',
      'Read 30 pages today',
      'Finish one chapter',
      'Read two chapters today',
      'Read 15 pages before bed',
      'Read 5 pages with your morning tea',
      'Read 25 pages without checking your phone',
      'Read the next 12 pages slowly',
      'Read 40 pages this afternoon',
    ],
    ['Quick Challenges', 'Reading Habit'],
  ),
  ...make(
    'Time',
    [
      'Read for 10 minutes',
      'Read for 20 minutes without distractions',
      'Complete a 30-minute reading session',
      'Spend 45 minutes with your book today',
      'Read for 15 minutes before breakfast',
      'Enjoy a quiet 5-minute read',
      'Read for 25 minutes in your favorite chair',
      'Set aside 40 minutes for reading',
    ],
    ['Quick Challenges', 'Reading Habit'],
    [10, 20, 30, 45, 15, 5, 25, 40],
  ),
  ...make(
    'Genre',
    [
      'Read a fantasy book',
      'Try a mystery book',
      'Read science fiction',
      'Choose historical fiction',
      'Try a biography',
      'Read classic literature',
      'Choose a genre you rarely read',
      'Explore a book about travel',
      'Read a humorous story',
      'Discover a work of philosophy',
      'Try a contemporary novel',
      'Read an adventure story',
      'Explore a science book',
      'Try a thriller',
      'Read a romance',
      'Explore a collection of poetry',
      'Read a short horror story',
      'Try a memoir',
      'Read a work of history',
      'Explore a graphic novel',
    ],
    ['Genre Explorer'],
  ),
  ...make(
    'Book Choice',
    [
      'Choose a book under 200 pages',
      'Choose a book over 400 pages',
      'Read the oldest unread book you own',
      'Pick a book with fewer than 10 chapters',
      'Return to a book you never finished',
      'Choose a book with a one-word title',
      'Pick a book recommended by a friend',
      'Read a book by an author new to you',
      'Choose a book from your own shelf',
      'Revisit a favorite book',
    ],
    ['Surprise Challenges'],
  ),
  ...make(
    'Experience',
    [
      'Read outside for 20 minutes',
      'Read without your phone nearby',
      'Read before going to bed',
      'Read somewhere you normally do not read',
      'Complete a silent 30-minute session',
      'Read a passage aloud',
      'Read by a window',
      'Enjoy a chapter with a warm drink',
      'Read after a short walk',
      'Read before opening social media',
    ],
    ['Reading Habit', 'Quick Challenges'],
  ),
  ...make(
    'Weekend',
    [
      'Read 50 pages this weekend',
      'Spend one hour with a book this weekend',
      'Finish a short book this weekend',
      'Read two chapters on Sunday',
      'Start your Saturday with 20 pages',
      'Set aside a quiet reading afternoon',
      'Explore a local library book',
      'Read outside on your day off',
      'Enjoy three chapters across the weekend',
      'Revisit a favorite story this weekend',
      'Read a chapter before your weekend plans begin',
      'Spend 30 minutes reading on Saturday morning',
      'Read 25 pages with your weekend breakfast',
      'Choose a short story for Sunday evening',
      'Read three poems over the weekend',
      'Finish the chapter you started during the week',
      'Try a new genre on your day off',
      'Read a book set somewhere you would like to visit',
      'Explore a nonfiction chapter this weekend',
      'Set aside 45 minutes for a peaceful Sunday read',
    ],
    ['Weekend Challenges'],
  ),
  ...make(
    'Classic',
    [
      'Start a classic you have never read',
      'Read a chapter of a nineteenth-century novel',
      'Explore a classic short story',
      'Read a classic from another country',
      'Revisit a passage from a favorite classic',
      'Try a classic adventure novel',
      'Read a classic mystery',
      'Explore a classic play',
      'Read a classic poem',
      'Choose a classic under 200 pages',
      'Try an ancient myth',
      'Explore a classic with a memorable heroine',
      'Read a chapter of a translated classic',
      'Pick a classic published before 1850',
      'Try a classic satire',
      'Read a classic about a journey',
      'Explore a classic coming-of-age story',
      'Read a classic set in the countryside',
      'Choose a classic historical novel',
      'Read the opening chapter of a famous classic',
    ],
    ['Classic Reading'],
  ),
];
export const packs = [
  {
    name: 'Quick Challenges',
    icon: '⚡',
    description: 'Short, 5–20 minute activities for any moment.',
  },
  {
    name: 'Weekend Challenges',
    icon: '📅',
    description: 'Longer reading activities for your free time.',
  },
  {
    name: 'Genre Explorer',
    icon: '🔮',
    description: 'Discover directions you have not tried before.',
  },
  {
    name: 'Classic Reading',
    icon: '📜',
    description: 'Explore great stories that stand the test of time.',
  },
  {
    name: 'Reading Habit',
    icon: '🍒',
    description: 'Small, repeatable daily reading activities.',
  },
  {
    name: 'Surprise Challenges',
    icon: '🎲',
    description: 'An unexpected invitation to read.',
  },
];
export function packChallenges(name: string) {
  if (name === 'Surprise Challenges') {
    return challenges;
  }
  if (name === 'Quick Challenges') {
    return challenges.filter(
      c => c.packs.includes(name) && (!c.seconds || c.seconds <= 1200),
    );
  }
  return challenges.filter(c => c.packs.includes(name));
}
export function generate(category?: string, pack?: string): Challenge {
  const pool = pack
    ? packChallenges(pack)
    : category
    ? challenges.filter(item => item.category === category)
    : challenges;
  return pick(pool.length ? pool : challenges);
}
