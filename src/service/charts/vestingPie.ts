export const vestingPie = (value: string) => {
  return {
    chart: {
      height: 300,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            color: '#888',
          },
        },
      },
    },
    fill: {
      colors: ['#956375'],
    },
    series: [value],
    labels: ['Vested'],
  };
};
