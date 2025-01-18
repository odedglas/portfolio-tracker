import { ApexOptions } from 'apexcharts';
import { groupBy } from 'lodash';
import { PortfolioHistory, StockCharData } from 'app/shared/types';
import { Formatter } from './base';
import { getDateYearMonthKey } from 'src/service/date';
import { midDay } from 'src/service/stocks/dates';

const Y_AXIS_BUFFER = 0.1;
const COLORS = {
  success: '#26A69A',
  danger: 'rgb(197, 69, 56)',
  benchmark: '#d6c2c2',
};

const getPortfolioMonthlySeries = (portfolioHistory: PortfolioHistory[]) => {
  const groupedHistory = groupBy(portfolioHistory, (historyItem) =>
    getDateYearMonthKey(historyItem.date)
  );

  return Object.entries(groupedHistory).map(([dateKey, historyRecords]) => {
    const lastItem = historyRecords[historyRecords.length - 1];
    const gainOrLoss = lastItem.currentValue - historyRecords[0].currentValue;

    return { x: dateKey, y: gainOrLoss / lastItem.invested };
  });
};

const getBenchmarksMonthlySeries = (
  benchmarks: StockCharData[],
  minDate: number
) => {
  return benchmarks.map((benchmark) => {
    const data = benchmark.close
      .map((close: number, index: number) => {
        return {
          x: midDay(new Date(benchmark.timestamp[index])),
          y: close,
        };
      })
      .filter((dataItem) => dataItem.x.getTime() >= minDate);

    const groupedData = groupBy(data, (dataItem) =>
      getDateYearMonthKey(dataItem.x.getTime())
    );

    return {
      name: benchmark.symbol,
      data: Object.entries(groupedData).map(([dateKey, dataItems]) => {
        const lastItem = dataItems[dataItems.length - 1];
        const gainOrLoss = lastItem.y - dataItems[0].y;

        return { x: dateKey, y: gainOrLoss / lastItem.y };
      }),
    };
  });
};

export const getPortfolioMonthlyYieldChartData = (
  portfolioHistory: PortfolioHistory[],
  benchmarks: StockCharData[],
  formatter: Formatter
): { series: unknown[]; options: ApexOptions } => {
  const historySeriesValues = getPortfolioMonthlySeries(portfolioHistory);
  const benchmarksSeries = getBenchmarksMonthlySeries(
    benchmarks,
    portfolioHistory[0]?.date
  );

  const barMainSeries = historySeriesValues.map((item, index) => ({
    ...item,
    goals: [
      {
        name: 'SPY',
        value: benchmarksSeries[0]?.data?.[index]?.y ?? 0,
        strokeHeight: 0,
        strokeWidth: 0,
      },
    ],
  }));

  const minValues = historySeriesValues
    .map((item) => item.y)
    .sort((a, b) => a - b);

  const benchmarksAnnotations = benchmarksSeries
    .map((series) => {
      return series.data.map((dataItem) => {
        return {
          x: new Date(dataItem.x).getTime(),
          y: dataItem.y,
          marker: {
            size: 4,
            fillColor: '#fff',
            strokeColor: '#d6c2c2',
            strokeWidth: 2,
            radius: 2,
            shape: 'circle',
          },
        };
      });
    })
    .flat();

  return {
    series: [
      {
        name: 'Portfolio Monthly Return',
        data: barMainSeries,
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
      colors: [COLORS.success, COLORS.benchmark],
      annotations: {
        points: benchmarksAnnotations,
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        customLegendItems: [
          'Portfolio',
          ...benchmarksSeries.map((series) => series.name),
        ],
        markers: {
          fillColors: [COLORS.success, COLORS.benchmark],
        },
      },
      plotOptions: {
        bar: {
          colors: {
            ranges: [
              {
                from: -100,
                to: 0,
                color: COLORS.danger,
              },
              {
                from: 0,
                to: 100,
                color: COLORS.success,
              },
            ],
          },
          borderRadius: 5,
          borderRadiusApplication: 'end',
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
              const item = historySeriesValues[opt.dataPointIndex];

              return item.y >= 0 ? COLORS.success : COLORS.danger;
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
        type: 'datetime',
      },
      tooltip: {
        shared: true,
        intersect: false,
        marker: {
          show: true,
        },
      },
    },
  };
};
