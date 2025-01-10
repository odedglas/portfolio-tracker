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
  fees: 'Fees',
  realized: 'Realized gains',
  capital: 'Capital gains',
  by_invested: 'By Invested',
  by_sector: 'By Sector',
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
    allocation_planner: {
      title: 'Allocation Planner',
      free_cash: 'Free cash flow',
      current_planned: 'Planned allocations',
      allocation_usage: 'Allocation usage',
      available_cash: 'Available cash',
      add_new_allocation: 'Create New Allocation',
      new_allocation: 'New Allocation',
      edit_allocation: 'Edit Allocation',
      empty_plans:
        'There are no planned allocations yet.. Start planning your allocation by creating a new one',
      activate_alert: 'Send me an alert when price reaches target price',
    },
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
    portfolio_performance: 'Portfolio investment growth',
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
  analytics: {
    title: 'Analytics',
  },
  stocks_plans: {
    title: 'Stocks Plans',
    new: 'New Stocks Plan',
    edit: 'Edit Plan',
    search_plan: "Add a new grants stock plan by searching it's ticker",
    rsu: 'RSU',
    espp: 'ESPP',
    esop: 'ESOP',
    terminate_plan: 'Terminate Plan',
    empty_plans:
      'No stocks plans were found... You can start by adding new one',
    add: 'Add new Plan',
    order: {
      new: 'New Stocks order',
      edit: 'Edit Stocks order',
    },
  },
  insights: {
    title: 'Insights',
    types: {
      title: {
        near50DaysMovingAverages: 'Near 50d moving averages',
        near200DaysMovingAverages: 'Near 200d moving averages',
        highShortInterest: 'High short interest',
        near52WeekLow: 'Near 52w low',
        below52WeekHigh: 'Below 52w high',
      },
      description: {
        near50DaysMovingAverages:
          "{name} is {deltaPercent} {direction} it's {movingAverageDays} day's moving average.",
        near200DaysMovingAverages:
          "{name} is {deltaPercent} {direction} it's {movingAverageDays} day's moving average.",
        highShortInterest:
          '{name} short interest is {shortRatio} which is {deltaPercent} above expected.',
        near52WeekLow: '{name} is near its 52 week low.',
        below52WeekHigh:
          "{name} is {deltaPercent} {direction} its 52-week-high and is above it's moving averages.",
      },
    },
    tags: {
      marketPrice: 'Market Price',
      fiftyTwoWeekHigh: '52w High',
      twoHundredDayAverage: '200d Avg',
      fiftyTwoWeekLow: '52w Low',
      fiftyDayAverage: '50d Avg',
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
  fixedPercent: {
    style: 'percent',
    useGrouping: false,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  },
  fixed: {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  },
  fixedSensitive: {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  },
  noneSensitiveCurrency: {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0, // set fraction digits to 0 to remove cents
    maximumFractionDigits: 0,
  },
  noneSensitiveDecimal: {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  },
};
