import { useEffect, useState } from 'react';

const calculateTimeLeft = () => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  // Calculate target month (current month + 2)
  let targetMonth = month + 2;
  let targetYear = year;

  // Handle year overflow
  if (targetMonth > 11) {
    targetMonth = targetMonth - 12;
    targetYear = year + 1;
  }

  // Create target date (10th of target month)
  const targetDate = new Date(targetYear, targetMonth, 10, 0, 0, 0, 0);
  let difference = +targetDate - +now;

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  return timeLeft;
};

export default useCountDownTime;
