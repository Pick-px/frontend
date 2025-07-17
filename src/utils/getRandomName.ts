export const generateRandomNickname = (): string => {
  const names = [
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'Ruby',
    'Go',
    'Swift',
    'Kotlin',
    'TypeScript',
    'PHP',
    'Rust',
    'Scala',
    'Perl',
    'Haskell',
    'Lua',
    'Dart',
    'SQL',
    'MATLAB',
    'Assembly',
    'Flutter',
    'React',
    'Nest',
    'Next',
    'Zustand',
    'nodeJS',
    'Umlang',
    'R',
    'HTML',
    'CSS',
    'Scratch',
  ];

  const getRandomItem = (arr: string[]): string =>
    arr[Math.floor(Math.random() * arr.length)];

  const generateRandomNumber = (min: number, max: number): string =>
    Math.floor(min + Math.random() * (max - min + 1)).toString();

  const selectNamePart = (): string => getRandomItem(names);

  const namePart = selectNamePart();

  const remainingLength = Math.max(0, 8 - namePart.length);

  const numberPart =
    remainingLength > 0
      ? generateRandomNumber(
          Math.pow(10, remainingLength - 1),
          Math.pow(10, remainingLength) - 1
        )
      : '';

  return `${namePart}${numberPart}`;
};
