export const variants = () => {
  return {
    center: {
      opacity: 1,
      x: '0%',
      y: 0,
      zIndex: 1,
    },
    enter: (direction: number) => ({
      opacity: 0,
      x: direction < 0 ? '-100%' : '100%',
      zIndex: 0,
    }),
    exit: (direction: number) => ({
      opacity: 0,
      x: direction < 0 ? '100%' : '-100%',
      zIndex: 0,
    }),
  };
};
