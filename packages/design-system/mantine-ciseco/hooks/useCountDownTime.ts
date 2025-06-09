'use client';

import { useInterval } from '@mantine/hooks';
import { useState } from 'react';

const calculateTimeLeft = () => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const difference = +new Date(`${month + 2}/10/${year}`) - +new Date();

  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

const useCountDownTime = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // ✅ Use Mantine's useInterval - automatically handles cleanup and prevents infinite loops
  useInterval(() => {
    setTimeLeft(calculateTimeLeft());
  }, 1000);

  return timeLeft;
};

export default useCountDownTime;
