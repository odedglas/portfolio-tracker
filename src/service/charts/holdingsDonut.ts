import { useHoldingsStore } from 'stores/holdings';
import { HoldingWithProfits } from 'app/shared/types';
import { Formatter } from './base';
import { COLOR_PALLET, FONT_FAMILY } from './constants';

type HoldingDataProperty = 'currentValue' | 'invested';

export const getHoldingsDonutChatOptions = (
  property: HoldingDataProperty = 'currentValue',
  formatter: Formatter,
  legendPosition = 'left'
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
        show: true,
        position: legendPosition,
        fontSize: 14,
        fontFamily: FONT_FAMILY,
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
      colors: COLOR_PALLET,
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontFamily: FONT_FAMILY,
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
            offset: 45,
          },
        },
      },
      tooltip: {
        y: {
          show: true,
          formatter: (value: number) => formatter(value, 'decimal'),
        },
      },
    },
  };
};
