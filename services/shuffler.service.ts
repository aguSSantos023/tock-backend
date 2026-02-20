export const getShufflerConfig = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOffYear = Math.floor(diff / oneDay);

  const isEven: boolean = dayOffYear % 2 === 0;

  return {
    currentCol: isEven ? "order_par" : "order_impar",
    oppositeCol: isEven ? "order_impar" : "order_par",
    isEven,
  };
};

export const generateRandomCode = (length: number = 3): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomNumber = Math.floor(Math.random() * characters.length);

    result += characters.charAt(randomNumber);
  }

  return result;
};
