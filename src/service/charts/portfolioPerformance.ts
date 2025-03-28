import { midDay } from 'src/service/stocks/dates';
import { PortfolioHistory, StockCharData, Transaction } from 'app/shared/types';
import { ChartSeries, Formatter } from './base';
import {
  COLOR_PALLET,
  SERIES_COLORS_PALLET,
} from 'src/service/charts/constants';

type Mode = 'value' | 'percentage';

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
      lastKnownValue = seriesDataPoint.y;
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
 * @param mode
 */
const normalizeBenchmarkValue = (
  series: ChartSeries,
  portfolioHistory: PortfolioHistory[],
  mode: Mode
) => {
  const isPercentageMode = mode === 'percentage';
  const [historyStartingPoint] = portfolioHistory;
  const [benchmarkStartingPoint] = series.data;

  let lastInvested = historyStartingPoint.invested,
    currentShares = historyStartingPoint.invested / benchmarkStartingPoint.y; // Takes currentValue to ensure a "pure" comparison.

  let avgPrice = benchmarkStartingPoint.y;

  series.data = series.data.map((point, index) => {
    const currentInvested = portfolioHistory[index].invested;

    if (currentInvested > lastInvested) {
      // Assume to purchase new benchmark stocks with given deposit delta.
      const newDeposit = currentInvested - lastInvested;
      const newSharesAmount = newDeposit / point.y;

      avgPrice =
        (currentShares * avgPrice + point.y * newSharesAmount) /
        (currentShares + newSharesAmount);

      currentShares += newSharesAmount;
    }

    lastInvested = currentInvested;

    const value = point.y * currentShares;
    const profitPercentage =
      (value - avgPrice * currentShares) / currentInvested;

    return {
      ...point,
      y: isPercentageMode ? profitPercentage : value,
      close: point.y,
    };
  });

  return series;
};

const normalizePerformanceData = (
  portfolioHistory: PortfolioHistory[],
  benchmarks: StockCharData[],
  periodTimeRange: number[],
  mode: Mode
) => {
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
        const profitInvestmentPercent =
          (history.currentValue - history.invested) / history.invested;

        return {
          x: midDay(new Date(history.date)),
          y: mode === 'value' ? history.currentValue : profitInvestmentPercent,
        };
      }),
    },
    periodTimeRange
  );

  const benchmarksSeries = benchmarks
    .map((benchmark) => {
      return {
        name: benchmark.symbol,
        data: benchmark.close.map((close: number, index: number) => {
          return {
            x: midDay(new Date(benchmark.timestamp[index])),
            y: close,
          };
        }),
      };
    })
    .filter((series) => series.data.length > 1)
    .map((series) => normalizeSeriesTimePeriod(series, periodTimeRange))
    .map((series) => normalizeBenchmarkValue(series, periodHistoryItems, mode));

  // Ensuring each series includes data point for each day in the period time.
  return [portfolioHistorySeries, ...benchmarksSeries];
};

const buildTransactionsAnnotations = (
  portfolioSeries: ChartSeries,
  transactionsMap: Map<number, Transaction[]>,
  periodTimeRange: number[]
) => {
  const [portfolioMarkerColor] = SERIES_COLORS_PALLET;
  const [sellAnnotationColor] = COLOR_PALLET;

  const isWithinRange = (date: number) =>
    date >= periodTimeRange[0] &&
    date <= periodTimeRange[periodTimeRange.length - 1];

  return {
    yaxis: [
      {
        y: 0,
        strokeDashArray: 1,
        borderColor: '#c2c2c2',
        fillColor: '#c2c2c2',
        yAxisIndex: 0,
      },
    ],
    points: [...transactionsMap.entries()]
      .filter(([d]) => isWithinRange(d))
      .map(([date, transactionGroup]) => {
        const isSingle = transactionGroup.length === 1;

        const transactionDate = midDay(new Date(date));
        const isBuyAction = (transactionGroup[0]?.action ?? '') === 'buy';

        const displayText = isSingle
          ? isBuyAction
            ? 'B'
            : 'S'
          : transactionGroup.length;

        return {
          x: transactionDate.getTime(),
          y: portfolioSeries?.data.find(
            (dataPoint) => dataPoint.x.getTime() === transactionDate.getTime()
          )?.y,
          marker: {
            size: 6,
            fillColor: 'white',
            strokeColor: isBuyAction
              ? portfolioMarkerColor
              : sellAnnotationColor,
            strokeWidth: 1,
          },
          label: {
            borderColor: isBuyAction
              ? portfolioMarkerColor
              : sellAnnotationColor,
            offsetY: -2,
            style: {
              color: 'grey',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: {
                top: 2,
                bottom: 2,
                left: 4,
                right: 4,
              },
              borderRadius: 2,
            },
            text: displayText,
          },
        };
      }),
  };
};

export const getPortfolioPerformanceChart = (
  portfolioHistory: PortfolioHistory[],
  benchmarks: StockCharData[],
  periodTimeRange: number[],
  transactionsMap: Map<number, Transaction[]>,
  formatter: Formatter,
  onZoom: (
    ctx: unknown,
    values: { xaxis: { min: number; max: number } }
  ) => void,
  mode: Mode = 'value'
) => {
  const isPercentageMode = mode === 'percentage';
  const series = normalizePerformanceData(
    portfolioHistory,
    benchmarks,
    periodTimeRange,
    mode
  );

  const [portfolioSeries] = series;

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
      annotations: buildTransactionsAnnotations(
        portfolioSeries,
        transactionsMap,
        periodTimeRange
      ),
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
          inverseColors: false,
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.1,
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
        min: undefined,
        ...(isPercentageMode && { stepSize: 2 }),
        labels: {
          formatter: (value: number) => {
            if (!value) {
              return value;
            }

            if (isPercentageMode) {
              return formatter(value, 'fixedPercent');
            }

            return `${(value / 1000).toFixed(0)}K`;
          },
        },
      },
      tooltip: {
        shared: true,
        followCursor: true, // Tooltip follows the cursor
        intersect: false, // Allows tooltip to show on hover instead of click
        y: {
          formatter: (value: number) => {
            if (!value) {
              return value;
            }

            return formatter(value, isPercentageMode ? 'percent' : 'decimal');
          },
        },
        marker: {
          show: true,
        },
      },
    },
  };
};
