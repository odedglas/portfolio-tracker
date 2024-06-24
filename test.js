if (!process.env.API_KEY) {
  throw new Error('Missing env var: API_KEY');
}
