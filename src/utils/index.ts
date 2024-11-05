export const uid = () => (Math.random() + 1).toString(36).substring(7);

export const shortHoldingName = (name?: string) =>
  name?.replace(', Inc.', '').replace('Series 1', '');
