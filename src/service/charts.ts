import { HoldingWithProfits } from 'src/types';
import { useHoldingsStore } from 'stores/holdings';

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
        fontFamily: 'inherit',
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
          fontFamily: 'inherit',
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
          fontFamily: 'inherit',
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
                to: 0,
                color: '#CD363A',
              },
              {
                from: 0.001,
                to: 100,
                color: '#52B12C',
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
