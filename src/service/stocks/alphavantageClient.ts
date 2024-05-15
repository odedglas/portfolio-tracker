import AlphaVantage, { DataType } from 'alphavantage-wrapper-ts';

const apikey = process.env.ALPHAVANTAGE_API_KEY as string;

const client = new AlphaVantage({ apikey });

export const alphavantage = {
  search: (ticker: string) => {
    return client.stockTimeSeries.search({
      keywords: ticker,
      datatype: DataType.JSON,
    });
  },
};
