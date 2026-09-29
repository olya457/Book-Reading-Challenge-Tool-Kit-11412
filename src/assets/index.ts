export const assets = {
  logo: require('./folio-book-logo.png'),
  welcome: require('./folio-guide-welcome.png'),
  challenge: require('./folio-guide-challenges.png'),
  reading: require('./folio-guide-reading.png'),
  calculator: require('./folio-guide-calculator.png'),
  rest: require('./folio-guide-break.png'),
};
export type Pose = Exclude<keyof typeof assets, 'logo'>;
