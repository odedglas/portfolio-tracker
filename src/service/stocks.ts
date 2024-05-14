const LOGO_CDN = 'https://eodhd.com/img/logos/US';

export const findTickerImage = (ticker: string) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = `${LOGO_CDN}/${ticker}.png`;

    if (image.complete) {
      return image.src;
    }

    image.onload = () => resolve(image.src);
    image.onerror = () => reject();
  });

export const getTickerData = async (ticker: string) => {
  const logoImage = await findTickerImage(ticker);

  console.log(logoImage);
};
