import { useI18n } from 'vue-i18n';
import { HoldingWithProfits } from 'src/types';
import { useHoldingsStore } from 'stores/holdings';

export const getHoldingsDonutChatOptions = () => {
  const i18n = useI18n();
  const holdingsStore = useHoldingsStore();

  const holdings: HoldingWithProfits[] = holdingsStore.portfolioHoldings.sort(
    (a, b) => b.currentValue - a.currentValue
  );

  const totalValue = holdings.reduce(
    (acc, { currentValue }) => acc + currentValue,
    0
  );

  return {
    series: holdings.map(({ currentValue }) => currentValue),
    options: {
      labels: holdings.map(({ name }) => name),
      legend: {
        fontSize: 14,
        itemMargin: {
          vertical: 6,
        },
        formatter: (seriesName: string) => {
          const holdingValue =
            holdings.find(({ name }) => name === seriesName)?.currentValue ?? 0;

          return `${seriesName} - ${i18n.n(
            holdingValue / totalValue,
            'percent'
          )}`;
        },
        onItemHover: {
          highlightDataSeries: false,
        },
      },
      colors: [
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
      ],
      dataLabels: {
        enabled: true,
        offsetX: 0,
        style: {
          fontSize: '12px',
          fontWeight: 'normal',
          colors: ['#9e9e9e'],
        },
        dropShadow: {
          enabled: false,
        },
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          dataLabels: {
            offset: 55,
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value: number) => i18n.n(value, 'decimal'),
        },
      },
    },
  };
};
