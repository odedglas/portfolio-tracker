const LOGO_CDN = 'https://eodhd.com/img/logos/US';
import { alphavantage } from './alphavantageClient';

export const findTickerImage = (ticker: string): Promise<string> =>
  new Promise((resolve) => {
    const logoUrl = `${LOGO_CDN}/${ticker}.png`;

    const image = new Image();
    image.src = logoUrl;

    if (image.complete) {
      return resolve(logoUrl);
    }

    image.onload = () => resolve(logoUrl);
    image.onerror = () => resolve('');
  });

export const getTickerData = async (ticker: string) => {
  const searchResults = (await alphavantage.search(ticker)).filter(
    (result) => result.currency === 'USD'
  );

  const logos = await Promise.all(
    searchResults.map((result) =>
      result.type === 'Equity'
        ? findTickerImage(result.symbol)
        : Promise.resolve('')
    )
  );

  return searchResults.map((result, index) => ({
    ...result,
    logoImage: logos[index],
  }));
};
