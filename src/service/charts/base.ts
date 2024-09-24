export type Formatter = (value: number, type: string) => string;

export type ChartSeries = {
  name: string;
  data: {
    x: Date;
    y: number;
  }[];
};
