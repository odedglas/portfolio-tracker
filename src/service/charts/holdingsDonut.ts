import { Platform } from 'quasar';
import { Formatter } from './base';
import { COLOR_PALLET, FONT_FAMILY } from './constants';

type HoldingDataProperty = 'currentValue' | 'invested';

type HoldingSeriesItem = {
  name: string;
  currentValue: number;
  invested: number;
  title?: string;
};

export const getHoldingsDonutChatOptions = (
  holdings: HoldingSeriesItem[],
  property: HoldingDataProperty = 'currentValue',
  formatter: Formatter,
  onSeriesClick: (name: string) => void,
  legendPosition = Platform.is.desktop ? 'right' : 'bottom'
) => {
  const sortedHoldings = holdings.sort((a, b) => b[property] - a[property]);

  const totalValue = sortedHoldings.reduce(
    (acc, holding) => acc + holding[property],
    0
  );

  return {
    series: sortedHoldings.map((holding) => holding[property]),
    options: {
      labels: sortedHoldings.map(({ name }) => name),
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
      chart: {
        events: {
          dataPointSelection: (
            _event: unknown,
            _ctx: unknown,
            dataPointContext: { dataPointIndex: number }
          ) => {
            onSeriesClick(sortedHoldings[dataPointContext.dataPointIndex].name);
          },
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
            offset: Platform.is.desktop ? 55 : 45,
          },
        },
      },
      tooltip: {
        y: {
          show: true,
          formatter: (value: number) => `${formatter(value, 'decimal')}`,
        },
      },
    },
  };
};
