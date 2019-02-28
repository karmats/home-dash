const leftPad = (str: string, width: number, symbol?: string) => {
  const spaces = width - str.length;
  for (let i = 0; i < spaces; i++) {
    str = (symbol || ' ') + str;
  }
  return str;
};

export const dateToTime = (date: Date): string =>
  `${leftPad(date.getHours().toString(), 2, '0')}:${leftPad(date.getMinutes().toString(), 2, '0')}`;
