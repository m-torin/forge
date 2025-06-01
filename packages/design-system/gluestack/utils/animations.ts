import { Easing } from 'react-native';

export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    ease: Easing.ease,
    easeIn: Easing.in(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    easeInOut: Easing.inOut(Easing.ease),
    linear: Easing.linear,
    bounce: Easing.bounce,
  },
};

export const fadeInAnimation = {
  from: { opacity: 0 },
  to: { opacity: 1 },
};

export const slideUpAnimation = {
  from: { transform: [{ translateY: 20 }], opacity: 0 },
  to: { transform: [{ translateY: 0 }], opacity: 1 },
};

export const scaleAnimation = {
  from: { transform: [{ scale: 0.95 }], opacity: 0 },
  to: { transform: [{ scale: 1 }], opacity: 1 },
};

export const slideInFromRightAnimation = {
  from: { transform: [{ translateX: 100 }], opacity: 0 },
  to: { transform: [{ translateX: 0 }], opacity: 1 },
};

export const slideInFromLeftAnimation = {
  from: { transform: [{ translateX: -100 }], opacity: 0 },
  to: { transform: [{ translateX: 0 }], opacity: 1 },
};