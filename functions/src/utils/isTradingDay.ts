const SUNDAY_INDEX = 0;
const SATURDAY_INDEX = 6;

export const isTradingDay = () => {
  const dayOfWeek = new Date().getDay();

  return ![SUNDAY_INDEX, SATURDAY_INDEX].includes(dayOfWeek);
};
