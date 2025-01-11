import { PortfolioHistory, StockCharData } from 'app/shared/types';
import { Formatter } from './base';
import { formatShortDate, getMonthYear } from 'src/service/date';

const Y_AXIS_BUFFER = 0.1;

export const getPortfolioMonthlyYieldChartData = (
  portfolioHistory: Record<string, PortfolioHistory[]>,
  benchmarks: StockCharData[],
  formatter: Formatter
) => {
  const seriesValues = Object.entries(portfolioHistory).map(
    ([dateKey, historyRecords]) => {
      const lastItem = historyRecords[historyRecords.length - 1];
      const gainOrLoss = lastItem.currentValue - historyRecords[0].currentValue;

      return { x: dateKey, y: gainOrLoss / lastItem.invested };
    }
  );

  const minValues = seriesValues.map((item) => item.y).sort((a, b) => a - b);

  return {
    series: [
      {
        name: 'Portfolio Monthly Return',
        data: seriesValues,
      },
    ],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        stacked: false,
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        animations: {
          speed: 100,
        },
      },
      plotOptions: {
        bar: {
          colors: {
            ranges: [
              {
                from: -100,
                to: 0,
                color: 'rgb(197, 69, 56)',
              },
              {
                from: 0,
                to: 100,
                color: '#26A69A',
              },
            ],
          },
          columnWidth: '80%',
          dataLabels: {
            position: 'top',
            hideOverflowingLabels: true,
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        formatter: (y: number) => formatter(y, 'percent'),
        style: {
          fontSize: '12px',
          colors: [
            (opt: { dataPointIndex: number }) => {
              const item = seriesValues[opt.dataPointIndex];

              return item.y >= 0 ? '#26A69A' : 'rgb(197, 69, 56)';
            },
          ],
        },
      },
      yaxis: {
        labels: {
          formatter: (y: number) => formatter(y, 'percent'),
        },
        min: minValues[0] - Y_AXIS_BUFFER,
        max: minValues[minValues.length - 1] + Y_AXIS_BUFFER,
      },
      grid: {
        strokeDashArray: 4,
      },
      xaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
        labels: {
          formatter: (y: string) => getMonthYear(y),
        },
        type: 'datetime',
        convertedCatToNumeric: false,
      },
    },
  };
};
