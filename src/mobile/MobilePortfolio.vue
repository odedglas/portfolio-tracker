<template>
  <div class="flex column q-gap-lg">
    <p class="text-h6 text-grey-8 q-px-md q-my-none text-weight-regular">
      Portfolio
    </p>
    <mobile-abstract-list title="Holdings" :items="holdings" />
    <mobile-abstract-list title="Transactions" :items="transactions" />
    <mobile-abstract-list title="Deposits" :items="deposits" />
  </div>
</template>

<script lang="ts">
import capitalize from 'lodash/capitalize';
import { computed, defineComponent } from 'vue';
import MobileAbstractList from 'src/mobile/MobileAbstractList.vue';
import { usePortfolioStore } from 'stores/portfolios';
import { Deposit } from 'app/shared/types';
import { useViewTransactions } from 'components/composables/useViewTransactions';
import { useViewHoldings } from 'components/composables/useViewHoldings';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'MobilePortfolio',
  components: { MobileAbstractList },
  setup() {
    const $n = useI18n().n;
    const portfolioStore = usePortfolioStore();
    const { viewTransactions } = useViewTransactions();
    const { viewHoldings } = useViewHoldings();

    const depositsIcons: Record<Deposit['type'], string> = {
      deposit: 'attach_money',
      withdrawal: 'money_off',
      balance: 'balance',
    };

    const deposits = computed(
      () =>
        portfolioStore.selectedPortfolioWithHoldings?.deposits.map(
          (deposit) => ({
            title: deposit.type,
            date: deposit.date,
            value: deposit.value,
            icon: depositsIcons[deposit.type],
          })
        ) ?? []
    );

    const transactions = computed(() =>
      viewTransactions.value.map((transaction) => ({
        title: transaction.ticker,
        subtitle: transaction.name,
        caption: `${capitalize(transaction.action)} ${
          transaction.shares
        } shares at $${transaction.price}`,
        date: transaction.date,
        value: transaction.totalValue.value * -1,
        ticker: {
          symbol: transaction.ticker,
          logoImage: transaction.logoImage,
        },
      }))
    );

    const holdings = computed(() =>
      viewHoldings.value.map((holding) => ({
        title: holding.ticker,
        subtitle: holding.shortName,
        caption: `${holding.shares} shares | AVG ${$n(
          holding.avgPrice,
          'decimal'
        )}`,
        dateLabel: `Invested: ${$n(holding.invested, 'currency')}`,
        value: holding.profit.value,
        percent: holding.profit.percent,
        ticker: {
          symbol: holding.ticker,
          logoImage: holding.logoImage,
        },
      }))
    );

    return {
      deposits,
      transactions,
      holdings,
    };
  },
});
</script>
