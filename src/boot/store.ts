import { boot } from 'quasar/wrappers';
import { usePortfolioStore } from 'stores/portfolios';

/**
 * Initialize Firebase application.
 */
export default boot(async () => {
  const portfolioStore = usePortfolioStore();

  await portfolioStore.list();
});
