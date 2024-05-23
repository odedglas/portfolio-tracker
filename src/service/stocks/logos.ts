const LOGO_CDN = 'https://eodhd.com/img/logos/US';

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
