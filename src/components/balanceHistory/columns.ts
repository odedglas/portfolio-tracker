import { QTableColumn } from 'quasar';
import { formatShortDate } from 'src/service/date';

export const columns: QTableColumn[] = [
  {
    name: 'date',
    label: 'Date',
    field: 'date',
    align: 'left',
    sortable: true,
    format: formatShortDate,
  },
  {
    name: 'description',
    label: 'Description',
    align: 'center',
    field: 'description',
    classes: 'text-capitalize',
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    align: 'center',
    sortable: true,
  },
  {
    name: 'value',
    label: 'Value',
    field: 'value',
    align: 'center',
    sortable: true,
  },
  {
    name: 'balance',
    label: 'Balance',
    field: 'balance',
    align: 'center',
    sortable: true,
  },
];
