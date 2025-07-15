
const calculateMetrics = () => {
  const success = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
  const error = Math.random() * (0.5 - 0.15) * success + 0.15 * success;
  const fail = Math.random() * 0.2 * success;

  return {
    Success: success,
    Error: Math.min(error, success * 0.5),
    Fail: Math.min(fail, error),
  };
};

export const data = [
  { date: '2023-03-22', ...calculateMetrics() },
  { date: '2023-03-23', ...calculateMetrics() },
  { date: '2023-03-24', ...calculateMetrics() },
  { date: '2023-03-25', ...calculateMetrics() },
  { date: '2023-03-26', ...calculateMetrics() },
  { date: '2023-03-27', ...calculateMetrics() },
  { date: '2023-03-28', ...calculateMetrics() },
  { date: '2023-03-29', ...calculateMetrics() },
  { date: '2023-03-30', ...calculateMetrics() },
  { date: '2023-03-31', ...calculateMetrics() },
  { date: '2023-04-01', ...calculateMetrics() },
  { date: '2023-04-02', ...calculateMetrics() },
  { date: '2023-04-03', ...calculateMetrics() },
  { date: '2023-04-04', ...calculateMetrics() },
  { date: '2023-04-05', ...calculateMetrics() },
  { date: '2023-04-06', ...calculateMetrics() },
  { date: '2023-04-07', ...calculateMetrics() },
  { date: '2023-04-08', ...calculateMetrics() },
  { date: '2023-04-09', ...calculateMetrics() },
  { date: '2023-04-10', ...calculateMetrics() },
  { date: '2023-04-11', ...calculateMetrics() },
  { date: '2023-04-12', ...calculateMetrics() },
  { date: '2023-04-13', ...calculateMetrics() },
  { date: '2023-04-14', ...calculateMetrics() },
  { date: '2023-04-15', ...calculateMetrics() },
  { date: '2023-04-16', ...calculateMetrics() },
  { date: '2023-04-17', ...calculateMetrics() },
  { date: '2023-04-18', ...calculateMetrics() },
  { date: '2023-04-19', ...calculateMetrics() },
  { date: '2023-04-20', ...calculateMetrics() },
  { date: '2023-04-21', ...calculateMetrics() },
  { date: '2023-04-22', ...calculateMetrics() },
  { date: '2023-04-23', ...calculateMetrics() },
  { date: '2023-04-24', ...calculateMetrics() },
  { date: '2023-04-25', ...calculateMetrics() },
  { date: '2023-04-26', ...calculateMetrics() },
  { date: '2023-04-27', ...calculateMetrics() },
];
