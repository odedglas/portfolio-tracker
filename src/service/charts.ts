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
