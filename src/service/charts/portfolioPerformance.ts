import { buildDateRangeFromToday, midDay } from 'src/service/stocks/dates';
import { PortfolioHistory, StockChartResponse } from 'app/shared/types';
import { ChartSeries, Formatter } from './base';
import { SERIES_COLORS_PALLET } from 'src/service/charts/constants';

/**
 * Ensures a given series includes data point for each day in the period time.
 * Sets the previous available value for any missing date point
 * @param series
 * @param timeRange
 */
const normalizeSeriesTimePeriod = (
  series: ChartSeries,
  timeRange: number[]
) => {
  const seriesData = series.data;
  let matchIndex = 0,
    lastKnownValue = 0;

  const normalizedData = timeRange.map((periodDate) => {
    const seriesDataPoint = seriesData[matchIndex];

    if (seriesDataPoint?.x?.getTime() === periodDate) {
      matchIndex++;
      return seriesDataPoint;
    }

    // Find closest datapoint from series to period data if not matched.
    const nextDataPointIndex = seriesData.findIndex(
      (dataPoint) => dataPoint.x.getTime() > periodDate
    );

    matchIndex = nextDataPointIndex;

    const normalizedDate = midDay(new Date(periodDate));
    const normalizedValue =
      seriesData[nextDataPointIndex - 1]?.y ?? lastKnownValue;

    lastKnownValue = normalizedValue;

    return { x: normalizedDate, y: normalizedValue };
  });

  return {
    ...series,
    data: normalizedData,
  };
};

/**
 * Normalizes a given benchmark data with portfolio history items, each deposit change will be considered
 * as a purchase with the closing price.
 * @param series
 * @param portfolioHistory
 */
const normalizeBenchmarkValue = (
  series: ChartSeries,
  portfolioHistory: PortfolioHistory[]
) => {
  let lastDeposit = 0,
    currentShares = 0;

  series.data = series.data.map((point, index) => {
    const currentDeposit = lastDeposit
      ? portfolioHistory[index]?.invested
      : portfolioHistory[index].currentValue;

    if (currentDeposit > lastDeposit) {
      currentShares += (currentDeposit - lastDeposit) / point.y;
    }

    lastDeposit = currentDeposit;

    const value = point.y * currentShares;

    return { ...point, y: value, close: point.y };
  });

  return series;
};

const normalizePerformanceData = (
  portfolioHistory: PortfolioHistory[],
  benchmarks: StockChartResponse
) => {
  const periodTimeRange = buildDateRangeFromToday();

  const periodHistoryItems = portfolioHistory.filter((history) =>
    periodTimeRange.includes(midDay(new Date(history.date)).getTime())
  );

  if (!periodHistoryItems.length) {
    return [];
  }

  const portfolioHistorySeries = normalizeSeriesTimePeriod(
    {
      name: 'Portfolio',
      data: periodHistoryItems.map((history) => {
        return {
          x: midDay(new Date(history.date)),
          y: history.currentValue,
        };
      }),
    },
    periodTimeRange
  );

  const benchmarksSeries = Object.entries(benchmarks)
    .map(([key, value]) => {
      return {
        name: key,
        data: value.close.map((close: number, index: number) => {
          return {
            x: midDay(new Date(value.timestamp[index])),
            y: close,
          };
        }),
      };
    })
    .filter((series) => series.data.length > 1)
    .map((series) => normalizeSeriesTimePeriod(series, periodTimeRange))
    .map((series) => normalizeBenchmarkValue(series, periodHistoryItems));

  // Ensuring each series includes data point for each day in the period time.
  return [portfolioHistorySeries, ...benchmarksSeries];
};

export const getPortfolioPerformanceChart = (
  portfolioHistory: PortfolioHistory[],
  benchmarks: StockChartResponse,
  formatter: Formatter,
  onZoom: () => void
) => {
  const series = normalizePerformanceData(portfolioHistory, benchmarks);

  return {
    series,
    options: {
      chart: {
        type: 'area',
        stacked: false,
        zoom: {
          type: 'x',
          enabled: true,
          autoScaleYaxis: true,
        },
        toolbar: {
          show: false,
        },
        animations: {
          speed: 100,
        },
        events: {
          beforeZoom: onZoom,
        },
      },
      colors: SERIES_COLORS_PALLET,
      legend: {
        offsetY: 8,
      },
      markers: {
        size: 0,
      },
      /*      annotations: {
        points: [{
          id: 'test-annot',
          x: series[0]?.data[0]?.x?.getTime(),
          y: series[0]?.data[0]?.y,
          strokeDashArray: 0,
          marker: {
            size: 5,
            strokeColor: '#775DD0',
            strokeWidth: 2,
          },
          borderColor: 'transparent',
          label: {
            offsetY: -10,
            orientation: 'horizontal',
            borderColor: '#775DD0',
            style: {
              color: '#fff',
              cssClass: 'apexcharts-point-annotation-label',
              background: '#775DD0',
            },
            text: 'B',
          }
        }],
      },*/
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: 'straight',
        width: 2,
      },
      grid: {
        strokeDashArray: 4,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
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
        convertedCatToNumeric: false,
      },
      yaxis: {
        forceNiceScale: true,
        labels: {
          formatter: (value: number) =>
            value ? `${(value / 1000).toFixed(0)}K` : value,
        },
      },
      tooltip: {
        shared: true,
        y: {
          formatter: (value: number) =>
            value ? formatter(value, 'decimal') : value,
        },
        marker: {
          show: true,
        },
      },
    },
  };
};
