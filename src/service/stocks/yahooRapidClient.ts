import axios from 'axios';
import { GetQuotesResponse, GetSearchResponse } from './schema';

const axiosInstance = axios.create({
  baseURL: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': 'b755b7ef07msh350b7776c07b300p112a41jsn7fc145707dc8', // TODO - Env
    'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
  },
});

const getRequest = async <Resolved>(url: string, params: object) => {
  const options = {
    method: 'GET',
    url,
    params,
  };

  try {
    const { data } = await axiosInstance.request<Resolved>(options);

    return data;
  } catch (error) {
    throw new Error('Failed to fetch search results');
  }
};

export const search = async (query: string) =>
  getRequest<GetSearchResponse>('/auto-complete', {
    q: query,
    region: 'US',
  });

export const getQuotes = (tickers: string[]) =>
  getRequest<GetQuotesResponse>('market/v2/get-quotes', {
    region: 'US',
    symbols: tickers.join(','),
  });
