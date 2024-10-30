import type { QTableProps } from 'quasar';

export const columns: QTableProps['columns'] = [
  {
    name: 'ticker',
    align: 'left',
    label: 'Holding Name',
    field: 'ticker',
    sortable: true,
  },
  {
    name: 'shares_amount',
    align: 'center',
    label: 'Shares Amount',
    field: 'shares',
  },
  {
    name: 'target_price',
    field: 'targetPrice',
    label: 'Target Price',
    align: 'center',
    sortable: true,
  },
  {
    name: 'usage',
    align: 'center',
    label: 'Allocation %',
    field: 'allocationsUsage',
  },
  { name: 'total', align: 'center', label: 'Total Value', field: 'totalValue' },
  { name: 'item_actions', align: 'center', label: '', field: 'none' },
];
