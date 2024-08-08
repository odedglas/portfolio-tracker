import {
  HoldingWithProfits,
  PortfolioHistory,
  StockChartResponse,
} from 'app/shared/types';
import { useHoldingsStore } from 'stores/holdings';
import { buildDateRange, midDay, startOfDay } from 'src/service/stocks/dates';

const fontFamily = 'inherit';

const colorPallet = [
  '#EC407A',
  '#AB47BC',
  '#7E57C2',
  '#5C6BC0',
  '#42A5F5',
  '#29B6F6',
  '#26C6DA',
  '#26A69A',
  '#66BB6A',
  '#9CCC65',
  '#D4E157',
  '#FFEE58',
  '#FFCA28',
  '#FFA726',
  '#FF7043',
  '#8D6E63',
  '#BDBDBD',
  '#78909C',
];

type Formatter = (value: number, type: string) => string;
type HoldingDataProperty = 'currentValue' | 'invested';

export const getHoldingsDonutChatOptions = (
  property: HoldingDataProperty = 'currentValue',
  formatter: Formatter
) => {
  const holdingsStore = useHoldingsStore();

  const holdings: HoldingWithProfits[] = holdingsStore.portfolioHoldings.sort(
    (a, b) => b[property] - a[property]
  );

  const totalValue = holdings.reduce(
    (acc, holding) => acc + holding[property],
    0
  );

  return {
    series: holdings.map((holding) => holding[property]),
    options: {
      labels: holdings.map(({ name }) => name),
      legend: {
        fontSize: 14,
        fontFamily,
        itemMargin: {
          vertical: 6,
        },
        formatter: (seriesName: string) => {
          const holdingValue =
            holdings.find(({ name }) => name === seriesName)?.[property] ?? 0;

          return `<span>${seriesName}</span> <span class="percent">${formatter(
            holdingValue / totalValue,
            'percent'
          )}</span>`;
        },
        onItemHover: {
          highlightDataSeries: false,
        },
      },
      colors: colorPallet,
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontFamily,
          fontWeight: 'normal',
          colors: ['#757575'],
        },
        dropShadow: {
          enabled: false,
        },
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          customScale: 0.95,
          dataLabels: {
            offset: 55,
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value: number) => formatter(value, 'decimal'),
        },
      },
    },
  };
};

export const getPortfolioHoldingsHeatMapChartOptions = (
  formatter: Formatter
) => {
  const holdingsStore = useHoldingsStore();

  const series = [
    {
      data: holdingsStore.portfolioHoldings.map((holding) => {
        const normalizedProfitPercent =
          holding.profit.percent * (holding.profit.value >= 0 ? 1 : -1) * 100;

        return {
          x: holding.ticker,
          y: formatter(normalizedProfitPercent, 'fixed'),
        };
      }),
    },
  ];

  return {
    series,
    options: {
      legend: {
        show: false,
      },
      chart: {
        type: 'treemap',
        height: 400,
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontFamily,
        },
        formatter: function (text: string, op: { value: string }) {
          return [text, `${op.value}%`];
        },
        offsetY: -4,
      },
      plotOptions: {
        treemap: {
          enableShades: false,
          colorScale: {
            ranges: [
              {
                from: -50,
                to: -6,
                color: 'rgb(197, 69, 56)',
              },
              {
                from: -6,
                to: -3,
                color: 'rgba(238, 81, 82, 0.92)',
              },
              {
                from: -3,
                to: 0,
                color: 'rgb(247, 124, 128)',
              },
              {
                from: 0,
                to: 0,
                color: 'rgb(193, 196, 205)',
              },
              {
                from: 0,
                to: 3,
                color: 'rgba(46, 169, 161, 0.55)',
              },
              {
                from: 3,
                to: 6,
                color: 'rgb(27, 197, 189)',
              },
              {
                from: 6,
                to: 100,
                color: 'rgb(46, 169, 161)',
              },
            ],
          },
        },
      },
      tooltip: {
        x: {
          show: true,
          formatter: (dataIndex: number) => {
            const holding = holdingsStore.portfolioHoldings[dataIndex - 1];

            return holding?.name ?? '';
          },
        },
        y: {
          formatter: (
            value: number,
            { dataPointIndex }: { dataPointIndex: number }
          ) => {
            const holding = holdingsStore.portfolioHoldings[dataPointIndex];

            if (!holding) {
              return `${value}%`;
            }

            return `${value}% (${formatter(holding.profit.value, 'currency')})`;
          },
          title: {
            formatter: (seriesName: string) => seriesName,
          },
        },
      },
    },
  };
};

const normalizePerformanceData = (
  portfolioHistory: PortfolioHistory[],
  benchmarks: StockChartResponse
) => {
  const seriesStartDate = new Date(
    Math.min(...portfolioHistory.map((history) => history.date))
  );

  const seriesEndDate = new Date(
    Math.max(...portfolioHistory.map((history) => history.date))
  );

  const seriesTimeRange = buildDateRange(seriesStartDate, seriesEndDate);

  const normalizedBenchmarks = Object.entries(benchmarks).map(
    ([key, value]) => {
      return {
        name: key,
        data: value.close.map((close: number, index: number) => {
          return {
            x: startOfDay(new Date(value.timestamp[index])),
            y: close,
          };
        }),
      };
    }
  );

  return normalizedBenchmarks;
};

export const getPortfolioPerformanceChart = (
  portfolioHistory: PortfolioHistory[],
  benchmarks: StockChartResponse,
  onZoom: () => void
) => {
  console.log('Portfolio History:', portfolioHistory, benchmarks);
  /*console.log('Normalized', normalizePerformanceData(portfolioHistory, benchmarks))*/

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
      markers: {
        size: 0,
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
        type: 'datetime',
      },
      tooltip: {
        shared: true,
      },
    },
  };
};
