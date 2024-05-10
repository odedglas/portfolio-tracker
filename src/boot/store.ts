import { boot } from 'quasar/wrappers';
import { authentication } from 'src/service/firebase';
import { usePortfolioStore } from 'stores/portfolios';
import { useUserStore } from 'stores/user';

/**
 * Fetches application related data view upon successful authentication.
 */
export default boot(async () => {
  const portfolioStore = usePortfolioStore();
  const userStore = useUserStore();

  authentication.onAuthStateChanged(async (user) => {
    if (user) {
      await portfolioStore.list();
    }

    userStore.setUser(user);
  });
});
