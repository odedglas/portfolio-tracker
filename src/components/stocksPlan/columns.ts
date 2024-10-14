import type { QTableProps } from 'quasar';

export const columns: QTableProps['columns'] = [
  { name: 'row_expand', align: 'center', label: '', field: 'none' },
  {
    name: 'grant_name',
    align: 'center',
    label: 'Grant Name',
    field: 'identifier',
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
    align: 'center',
  },
  {
    name: 'type',
    align: 'center',
    label: 'Type',
    field: 'type',
    sortable: true,
  },
  { name: 'amount', align: 'center', label: 'Grant Amount', field: 'amount' },
  {
    name: 'sold_shares',
    align: 'center',
    label: 'Sold Shares',
    field: 'soldShares',
  },
  { name: 'vested', align: 'center', label: 'Vested', field: 'vested' },
  {
    name: 'last_vested',
    align: 'center',
    label: 'Last Vested',
    field: 'lastVested',
  },
  {
    name: 'next_vesting',
    align: 'center',
    label: 'Next Vesting',
    field: 'nextVesting',
  },
  {
    name: 'sellable_value',
    align: 'center',
    label: 'Sellable Value',
    field: 'sellableValue',
  },
  {
    name: 'total_value',
    align: 'center',
    label: 'Total Value',
    field: 'potentialValue',
  },
  { name: 'item_actions', align: 'center', label: '', field: 'none' },
];
