import { clock, readingPlan } from '../src/utils/reading';
import {
  challenges,
  generate,
  packChallenges,
  packs,
} from '../src/data/challenges';
import { exercises, timedBreak } from '../src/data/breaks';

test('distributes the exact remaining pages across a finish deadline', () => {
  const plan = readingPlan(420, 165, 'days', 7);
  expect(plan.map(day => day.pages)).toEqual([37, 37, 37, 36, 36, 36, 36]);
  expect(plan[0].from).toBe(166);
  expect(plan[6].to).toBe(420);
});
test('caps the final day at the final page', () => {
  const plan = readingPlan(67, 7, 'pages', 25);
  expect(plan.map(day => day.pages)).toEqual([25, 25, 10]);
  expect(plan[2]).toEqual({ day: 3, pages: 10, from: 58, to: 67 });
});
test.each([
  [0, 0, 20],
  [10, 11, 20],
  [10, -1, 20],
  [10, 0, 0],
  [10, 0, -1],
  [10, 10, 20],
  [10, 0, 1.5],
  [100001, 0, 10],
])(
  'rejects invalid or completed calculation %p %p %p',
  (total, current, amount) => {
    expect(readingPlan(total, current, 'pages', amount)).toEqual([]);
  },
);
test('does not create empty reading days for a long deadline', () => {
  expect(readingPlan(10, 7, 'days', 30).map(day => day.pages)).toEqual([
    1, 1, 1,
  ]);
});
test('large plans remain contiguous and sum correctly', () => {
  for (const mode of ['pages', 'days'] as const) {
    const plan = readingPlan(1251, 153, mode, 31);
    expect(plan.reduce((sum, day) => sum + day.pages, 0)).toBe(1098);
    plan.slice(1).forEach((day, i) => expect(day.from).toBe(plan[i].to + 1));
    expect(plan[plan.length - 1].to).toBe(1251);
  }
});
test('formats timers without negative values', () => {
  expect(clock(3600)).toBe('60:00');
  expect(clock(59)).toBe('00:59');
  expect(clock(-2)).toBe('00:00');
});
test('all challenge packs contain valid challenges with unique IDs', () => {
  expect(new Set(challenges.map(item => item.id)).size).toBe(challenges.length);
  packs.forEach(pack => {
    const pool = packChallenges(pack.name);
    expect(pool.length).toBeGreaterThan(0);
    expect(pool).toContainEqual(generate(undefined, pack.name));
  });
});
test('category generators respect the selected category', () => {
  [
    'Pages',
    'Time',
    'Genre',
    'Classic',
    'Book Choice',
    'Experience',
    'Weekend',
  ].forEach(category => {
    for (let i = 0; i < 20; i++) {
      expect(generate(category).category).toBe(category);
    }
  });
});
test.each([1, 3, 5])('timed break lasts exactly %p minutes', minutes => {
  expect(
    timedBreak(minutes).steps.reduce((sum, step) => sum + step.seconds, 0),
  ).toBe(minutes * 60);
});
test('each exercise has a complete sequence', () => {
  exercises.forEach(exercise => {
    expect(exercise.steps.length).toBeGreaterThanOrEqual(5);
    exercise.steps.forEach(step => {
      expect(step.seconds).toBeGreaterThan(0);
      expect(step.text.length).toBeGreaterThan(0);
    });
  });
});
