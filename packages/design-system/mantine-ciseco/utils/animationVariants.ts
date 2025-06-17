export const variants = (x: any = 1000, opacity: any = 0) => ({
  center: {
    opacity: 1,
    x: 0,
  },
  enter: (direction: number) => {
    return {
      opacity,
      x: direction > 0 ? x : -x,
    };
  },
  exit: (direction: number) => {
    return {
      opacity,
      x: direction < 0 ? x : -x,
    };
  },
});
