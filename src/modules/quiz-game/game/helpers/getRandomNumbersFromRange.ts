const getRandomNumber = (max: number) => {
  return Math.floor(Math.random() * max);
};

export const getRandomNumbersFromRange = ({
  count,
  max,
}: {
  count: number;
  max: number;
}) => {
  const result: number[] = [];

  while (result.length < count) {
    const newNumber = getRandomNumber(max);

    if (!result.includes(newNumber)) {
      result.push(newNumber);
    }
  }

  return result;
};
