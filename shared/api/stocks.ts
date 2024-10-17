import axios, { AxiosRequestConfig } from 'axios';
import { FearAndGreedResponse } from 'app/shared/types';

const axiosInstance = axios.create({
  baseURL: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': process.env.RAPID_YAHOO_API_KEY,
    'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
  },
});

const featAndGreedInstance = axios.create({
  baseURL: 'https://fear-and-greed-index.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': process.env.RAPID_YAHOO_API_KEY,
    'X-RapidAPI-Host': 'fear-and-greed-index.p.rapidapi.com',
  },
});

const getRequest = async <Resolved>(
  url: string,
  params: object,
  httpsAgent?: AxiosRequestConfig['httpsAgent']
) => {
  const { data } = await axiosInstance.request<Resolved>({
    method: 'GET',
    url,
    params,
    ...(httpsAgent && { httpsAgent }),
  });

  return data;
};

export const stocksClient = {
  getRequest,
  getFearAndGreedIndex: () =>
    featAndGreedInstance.get<FearAndGreedResponse>('/v1/fgi'),
};
