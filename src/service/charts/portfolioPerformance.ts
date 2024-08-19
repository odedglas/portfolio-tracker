import { buildDateRangeFromToday, midDay } from 'src/service/stocks/dates';
import { PortfolioHistory, StockChartResponse } from 'app/shared/types';
import { ChartSeries, Formatter } from './base';

/**
 * Ensures a given series includes data point for each day in the period time.
 * Sets the previous available value for any missing date point
 * @param series
 * @param timeRange
 */
const normalizeSeriesTimePeriod = (series: ChartSeries, timeRange: number[]) => {
  const seriesData = series.data;
  let matchIndex = 0;
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

    const normalizedDate = midDay(new Date(periodDate));
    const normalizedValue = seriesData[nextDataPointIndex - 1]?.y ?? 0;

    return { x: normalizedDate , y: normalizedValue };
  });

  return {
    ...series,
    data: normalizedData,
  };
}

/**
 * Normalizes a given benchmark data with portfolio history items, each deposit change will be considered
 * as a purchase with the closing price.
 * @param series
 * @param portfolioHistory
 */
const normalizeBenchmarkValue = (series: ChartSeries, portfolioHistory: PortfolioHistory[]) => {
  let lastDeposit = 0, currentShares = 0;

  if (!portfolioHistory.length) {
    return series;
  }

  series.data = series.data.map((point, index) => {
    const currentDeposit = lastDeposit ? portfolioHistory[index]?.deposited : portfolioHistory[index].currentValue;

    if (currentDeposit > lastDeposit) {
      currentShares += (currentDeposit - lastDeposit) / point.y;
    }

    lastDeposit = currentDeposit;

    const value = point.y * currentShares;

    return { ...point, y: value };
  });

  return series;
};

const normalizePerformanceData = (
  portfolioHistory: PortfolioHistory[],
  benchmarks: StockChartResponse
) => {
  const periodTimeRange = buildDateRangeFromToday();

  const periodHistoryItems = portfolioHistory.filter(
    (history) => periodTimeRange.includes(midDay(new Date(history.date)).getTime())
  );

  const portfolioHistorySeries = normalizeSeriesTimePeriod({
    name: 'Portfolio',
    data: periodHistoryItems.map((history) => {
      return {
        x: midDay(new Date(history.date)),
        y: history.currentValue,
      };
    })
  }, periodTimeRange);

  const benchmarksSeries = Object.entries(benchmarks).map(
    ([key, value]) => {
      return {
        name: key,
        data: value.close.map((close: number, index: number) => {
          return {
            x: midDay(new Date(value.timestamp[index])),
            y: close,
          };
        }),
      };
    }
  )
    .filter((series) => series.data.length > 1)
    .map((series) => normalizeSeriesTimePeriod(series, periodTimeRange))
    .map((series) => normalizeBenchmarkValue(series, periodHistoryItems));

  // Ensuring each series includes data point for each day in the period time.
  return [portfolioHistorySeries, ...benchmarksSeries]
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
        events: {
          beforeZoom: onZoom,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: 'straight',
        width: 2,
      },
/*      markers: {
        discrete: [{
          seriesIndex: 0,
          dataPointIndex: 5,
          fillColor: '#ffffff',
          strokeColor: '#3c7b41',
          size: 7,
          shape: 'circle'
        }]
      },*/
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
        type: 'datetime',
      },
      yaxis: {
        labels: {
          formatter: (value: number) => formatter(value, 'decimal'),
        },
      },
      tooltip: {
        shared: true,
      },
    },
  };
};
