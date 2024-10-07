import type { QTableProps } from 'quasar';

export const columns: QTableProps['columns'] = [
  {
    name: 'name',
    align: 'center',
    label: 'Name',
    field: 'name',
    sortable: true,
  },
  {
    name: 'grant_date',
    field: 'grantDate',
    label: 'Grant Date',
    sortable: true,
    required: true,
    align: 'left',
  },
  {
    name: 'grant_price',
    label: 'Grant Price',
    field: 'grantPrice',
    sortable: true,
    align: 'left',
  },
  {
    name: 'type',
    align: 'center',
    label: 'Type',
    field: 'type',
    sortable: true,
  },
  { name: 'amount', align: 'center', label: 'Amount', field: 'amount' },
  { name: 'vested', align: 'center', label: 'Vested', field: 'vested' },
  {
    name: 'next_vesting',
    align: 'center',
    label: 'Next Vesting',
    field: 'nextVesting',
  },
  {
    name: 'last_vested',
    align: 'center',
    label: 'Last Vested',
    field: 'lastVested',
  },
  {
    name: 'current_value',
    align: 'center',
    label: 'Current Value',
    field: 'currentValue',
  },
  {
    name: 'total_value',
    align: 'center',
    label: 'Total Value',
    field: 'totalValue',
  },
  { name: 'item_actions', align: 'center', label: '', field: 'none' },
];
