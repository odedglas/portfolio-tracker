import { formatNotificationDate } from 'src/service/date';
import { ViewPortfolioInsight } from 'app/shared/types';
import { Formatter } from 'src/service/charts/base';

type InsightSparklineOptions = {
  insight: ViewPortfolioInsight;
  formatter: Formatter;
};

export const insightSparklineChartData = (options: InsightSparklineOptions) => {
  const { insight, formatter } = options;
  const historyInputs = insight.historyInputs ?? [];

  const triggerPrice =
    historyInputs[0]?.inputs?.regularMarketPrice ??
    insight.inputs.regularMarketPrice ??
    0;

  return {
    series: [
      {
        name: insight.holding.name,
        data: historyInputs.map(({ date, inputs: insightInputs }) => ({
          y: insightInputs.regularMarketPrice,
          x: date,
        })),
      },
    ],
    chart: {
      type: 'line',
      width: 260,
      height: 66,
      sparkline: {
        enabled: true,
      },
      animations: {
        enabled: false,
      },
    },
    annotations: {
      yaxis: [
        {
          y: triggerPrice,
          strokeDashArray: 1,
          borderColor: '#c2c2c2',
          fillColor: '#c2c2c2',
          yAxisIndex: 0,
          opacity: 0.3,
          label: {
            borderColor: 'transparent',
            offsetY: 14,
            text: `Triggered: ${formatter(triggerPrice, 'decimal')}`,
            style: {
              background: 'transparent',
            },
          },
        },
      ],
    },
    colors: ['#a21c48'],
    stroke: {
      width: 2,
      colors: ['#a21c48'],
    },
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        formatter: (v: number) => formatter(v, 'decimal'),
        title: {
          formatter: (_: unknown, data: { dataPointIndex: number }) => {
            const { dataPointIndex } = data;

            return `${formatNotificationDate(
              historyInputs[dataPointIndex].date
            )}: `;
          },
        },
      },
      marker: {
        show: false,
      },
    },
  };
};
