import type { QTableProps } from 'quasar';

export const columns: QTableProps['columns'] = [
  {
    name: 'action',
    field: 'action',
    label: 'Action',
    sortable: true,
    required: true,
    align: 'left',
  },
  {
    name: 'holdings_name',
    required: true,
    label: 'Holding Name',
    field: 'name',
    sortable: true,
    align: 'left',
  },
  {
    name: 'date',
    align: 'center',
    label: 'Date',
    field: 'date',
    sortable: true,
  },
  {
    name: 'shares',
    align: 'center',
    label: 'Shares',
    field: 'shares',
    sortable: true,
  },
  { name: 'price', align: 'center', label: 'Price per share', field: 'price' },
  { name: 'fees', align: 'center', label: 'Fees', field: 'fees' },
  {
    name: 'totalValue',
    align: 'center',
    label: 'Total Value',
    field: 'totalValue',
  },
  { name: 'total_profit', align: 'center', label: 'Profit', field: 'profit' },
  { name: 'item_actions', align: 'center', label: '', field: 'none' },
];
