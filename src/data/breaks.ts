export type Exercise = {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: { text: string; seconds: number }[];
};
const steps = (texts: string[], durations: number[]) =>
  texts.map((text, i) => ({ text, seconds: durations[i] }));
export const exercises: Exercise[] = [
  {
    id: 'eyes',
    title: 'Eye Break',
    icon: '👁',
    description: 'Rest and refresh your eyes between reading sessions.',
    steps: steps(
      [
        'Look away from the page.',
        'Look at a comfortable distant object.',
        'Blink naturally several times.',
        'Close your eyes briefly and relax.',
        'Open your eyes and look around slowly.',
        'Return to your book when you feel ready.',
      ],
      [10, 20, 15, 15, 15, 15],
    ),
  },
  {
    id: 'neck',
    title: 'Neck & Shoulders',
    icon: '🔄',
    description: 'Release tension from your reading posture.',
    steps: steps(
      [
        'Sit comfortably and let your shoulders drop naturally.',
        'Slowly roll your shoulders within a comfortable range.',
        'Return your head to a neutral position.',
        'Gently change your sitting position.',
        'Relax your arms and rest your hands.',
      ],
      [15, 20, 20, 20, 15],
    ),
  },
  {
    id: 'posture',
    title: 'Posture Reset',
    icon: '🪑',
    description: 'Simple position reminders for comfortable reading.',
    steps: steps(
      [
        'Sit comfortably with your back relaxed, not rigid.',
        'Relax your shoulders.',
        'Place your feet in a comfortable position.',
        'Hold your book at a comfortable height.',
        'Gently change your position.',
        'Notice how you feel before returning to your book.',
      ],
      [15, 15, 15, 15, 15, 15],
    ),
  },
  {
    id: 'relax',
    title: 'Quick Relaxation',
    icon: '✨',
    description: 'A brief moment to unwind before returning to the page.',
    steps: steps(
      [
        'Put the book or device down.',
        'Relax your hands and arms.',
        'Breathe naturally and let your shoulders soften.',
        'Make a small, comfortable change in position.',
        'Look into the distance for a moment.',
        'Prepare to return to reading at your own pace.',
      ],
      [15, 20, 25, 20, 20, 20],
    ),
  },
  {
    id: 'guided',
    title: 'Guided Break',
    icon: '🎯',
    description: 'A full guided break with your personal reading guide.',
    steps: steps(
      [
        'Put the book down gently.',
        'Let your arms rest comfortably.',
        'Look away at something in the distance.',
        'Blink naturally and relax your face.',
        'Change your sitting position comfortably.',
        'Take a quiet moment for yourself.',
        'Pick up your book when you feel ready.',
      ],
      [15, 15, 20, 15, 20, 20, 15],
    ),
  },
];
export function timedBreak(minutes: number): Exercise {
  const base = exercises[4];
  const seconds = minutes * 60;
  return {
    ...base,
    id: `timed-${minutes}`,
    title:
      minutes === 1
        ? 'Quick Break'
        : minutes === 3
        ? 'Standard Break'
        : 'Full Break',
    steps: base.steps.map((step, i) => ({
      ...step,
      seconds:
        Math.floor(seconds / base.steps.length) +
        (i < seconds % base.steps.length ? 1 : 0),
    })),
  };
}
