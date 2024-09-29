export const enUsMessages = {
  failed: 'Action failed',
  success: 'Action was successful',
  login: {
    login: 'Login',
    signup: 'Sign Up',
    dont_have_account: "Don't have an account yet ?",
    have_an_account: 'Already got an account ?',
  },
  header: {
    no_portfolios: 'You have no portfolios created just yet!',
    manage_portfolios: 'Manage Portfolios',
  },
  total: 'Total',
  deposit: 'Deposit',
  balance: 'Balance',
  withdrawal: 'Withdrawal',
  portfolios: {
    title: "Manage portfolio's",
    create: 'New Portfolio',
    edit: 'Edit Portfolio',
    profit: 'Profit',
    target: 'Target',
    target_explainer: 'You are {percentage} from reaching your target 🎉',
    invested: 'Invested',
    cash_flow: 'Cash Flow',
    kpis: {
      cash_flow: 'Cash Flow',
      holdings_value: 'Holdings Value',
    },
    initial_investment: 'Initial Investment',
    initial_value_explain:
      'The initial value will be converted to a "Deposit" item you can later manage',
    target_explain: 'The Target will be used to track your portfolio progress',
    empty: 'Still quiet here...',
  },
  transactions: {
    header: 'Transactions',
    search_ticker: 'Please enter a ticker symbol to search...',
    create: 'New Transaction',
    edit: 'Edit Transaction',
    buy: 'Buy',
    sell: 'Sell',
    fees: 'Fees',
    summary: 'Total transaction value',
    add_your_first: 'Add your first transaction',
    no_transactions_found:
      "There aren't any transactions yet found within your portfolio.",
    all_profit_is_realized: 'All profit is realized',
  },
  holdings: {
    header: 'Holdings',
    no_holdings:
      'No holding are there yet, You can start by creating a Transaction',
  },
  charts: {
    portfolio_value: 'Portfolio value',
    benchmarks: 'Benchmarks',
  },
  dashboard: {
    kpis: {
      cash_flow: 'Free Cash Flow',
      profit: 'Total Profit',
      value: 'Current Value',
    },
  },
  no_results: 'No results',
  cancel: 'Cancel',
  save: 'Save',
  add: 'Add',
  clone: 'Clone',
  delete: 'Delete',
  yes: 'Yes',
  no: 'No',
  reset: 'Reset',
  zoom_out: 'Zoom out',
};

export const enUsCurrency = {
  currency: {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0, // set fraction digits to 0 to remove cents
    maximumFractionDigits: 0,
  },
  decimal: {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  },
  percent: {
    style: 'percent',
    useGrouping: false,
    maximumFractionDigits: 2,
  },
  fixed: {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  },
};
