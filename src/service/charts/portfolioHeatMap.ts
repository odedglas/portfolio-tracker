import { useHoldingsStore } from 'stores/holdings';
import { Formatter } from './base';
import { FONT_FAMILY } from './constants';

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
          fontFamily: FONT_FAMILY,
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
