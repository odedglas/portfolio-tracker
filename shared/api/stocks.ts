import axios, { AxiosRequestConfig } from 'axios';
import { FearAndGreedResponse } from '../types';

const yahooFinanceInstance = axios.create({
  baseURL: 'https://yahoo-finance127.p.rapidapi.com',
});

const featAndGreedInstance = axios.create({
  baseURL: 'https://fear-and-greed-index.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': process.env.RAPID_YAHOO_API_KEY,
    'X-RapidAPI-Host': 'fear-and-greed-index.p.rapidapi.com',
  },
});

/**
 * Sets the headers for the Yahoo Finance API.
 */
const buildHeaders = () => ({
  'X-RapidAPI-Key': 'b755b7ef07msh350b7776c07b300p112a41jsn7fc145707dc8',
  'X-RapidAPI-Host': 'yahoo-finance127.p.rapidapi.com',
});

const getRequest = async <Resolved>(
  url: string,
  params: object,
  httpsAgent?: AxiosRequestConfig['httpsAgent']
) => {
  const { data } = await yahooFinanceInstance.request<Resolved>({
    method: 'GET',
    url,
    params,
    headers: buildHeaders(),
    ...(httpsAgent && { httpsAgent }),
  });

  return data;
};

export const stocksClient = {
  getRequest,
  getFearAndGreedIndex: () =>
    featAndGreedInstance.get<FearAndGreedResponse>('/v1/fgi'),
};
