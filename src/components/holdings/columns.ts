import type { QTableProps } from 'quasar';

export const columns: QTableProps['columns'] = [
  {
    name: 'holdings_name',
    required: true,
    label: 'Holding Name',
    field: 'name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'shares',
    align: 'center',
    label: 'Shares',
    field: 'shares',
    sortable: true,
  },
  { name: 'avg_price', align: 'center', label: 'Average Price', field: 'avgPrice' },
  {
    name: 'totalValue',
    align: 'center',
    label: 'Total Value',
    field: 'totalValue',
  },
  { name: 'total_profit', align: 'center', label: 'Profit', field: 'profit' },
  { name: 'daily_change', align: 'center', label: 'Daily', field: 'daily' },
];
