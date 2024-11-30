import { formatNotificationDate } from 'src/service/date';
import { ViewPortfolioInsight } from 'app/shared/types';
import { Formatter } from 'src/service/charts/base';

type InsightSparklineOptions = {
  insight: ViewPortfolioInsight;
  triggerPrice: number;
  formatter: Formatter;
};

export const insightSparklineChartData = (options: InsightSparklineOptions) => {
  const { insight, triggerPrice, formatter } = options;
  const inputs = insight.historyInputs ?? [];

  return {
    series: [
      {
        name: insight.holding.name,
        data: inputs.map(({ date, inputs: insightInputs }) => ({
          y: insightInputs.regularMarketPrice,
          x: date,
        })),
      },
    ],
    chart: {
      type: 'line',
      width: 200,
      height: 36,
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
          label: {
            borderColor: 'white',
            text: 'Trigger Price',
          },
        },
      ],
    },
    stroke: {
      width: 2,
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

            return `${formatNotificationDate(inputs[dataPointIndex].date)}: `;
          },
        },
      },
      marker: {
        show: false,
      },
    },
  };
};
