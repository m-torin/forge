export const range = (start: number, end: number) => {
  const output: any[] = [];
  if (typeof end === 'undefined') {
    end = start;
    start = 0;
  }
  for (let i = start; i < end; i += 1) {
    output.push(i);
  }
  return output;
};
