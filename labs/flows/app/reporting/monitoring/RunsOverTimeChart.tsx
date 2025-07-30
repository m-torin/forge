'use client';

import { AreaChart } from '@mantine/charts';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { data } from './data';

dayjs.extend(isoWeek);

interface DataEntry {
  date: string;
  Success: number;
  Error: number;
  Fail: number;
}

// Helper function to aggregate data by week and round values
const aggregateByWeek = (data: DataEntry[]): DataEntry[] => {
  const weekData: { [key: string]: DataEntry } = {};

  data.forEach((entry) => {
    const weekStart = dayjs(entry.date).startOf('isoWeek').format('YYYY-MM-DD');
    if (!weekData[weekStart]) {
      weekData[weekStart] = { date: weekStart, Success: 0, Error: 0, Fail: 0 };
    }
    weekData[weekStart].Success += entry.Success;
    weekData[weekStart].Error += entry.Error;
    weekData[weekStart].Fail += entry.Fail;
  });

  return Object.values(weekData).map((entry) => ({
    date: entry.date,
    Success: Math.round(entry.Success),
    Error: Math.round(entry.Error),
    Fail: Math.round(entry.Fail),
  }));
};

// Aggregating the data
const weeklyData: DataEntry[] = aggregateByWeek(data);

// Custom tick formatter for the x-axis
const dateTickFormatter = (date: string): string => {
  return dayjs(date).format('MMMM D');
};

export const RunsOverTimeChart = () => (
  <AreaChart
    h={300}
    data={weeklyData}
    withLegend
    dataKey="date"
    curveType="monotone"
    tooltipAnimationDuration={200}
    series={[
      { name: 'Success', color: 'teal.6' },
      { name: 'Error', color: 'orange.6' },
      { name: 'Fail', color: 'red.6' },
    ]}
    xAxisProps={{
      tickFormatter: dateTickFormatter,
    }}
    withXAxis
    withYAxis
    withTooltip
    withDots
  />
);

export default RunsOverTimeChart;
