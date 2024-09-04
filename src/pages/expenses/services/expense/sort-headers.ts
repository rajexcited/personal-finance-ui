import { SortDirection, SortType } from "../../../../components";
import { ExpenseFields } from "./field-types";

export interface ExpenseSortDetails {
  sortable: true;
  sortLevel?: number;
  datafieldKey: keyof ExpenseFields;
  sortDirection?: SortDirection;
  type?: SortType;
}

export interface SortableHeader extends ExpenseSortDetails {
  id: string;
  label: string;
}

interface UnSortableHeader {
  id: string;
  label: string;
  sortable: false;
}

export type Header = SortableHeader | UnSortableHeader;

export const rowHeaders: Header[] = [
  { id: "belongsTo", label: "Type", sortable: true, datafieldKey: "belongsTo" },
  { id: "pymt-acc", label: "Payment Account", sortable: true, datafieldKey: "paymentAccountName" },
  // {
  //   id: "prchs-dt",
  //   label: "Purchased/Refund Date",
  //   sortable: true,
  //   datafieldKey: "purchasedDate",
  //   sortLevel: 1,
  //   sortDirection: "desc",
  // },
  {
    id: "bill-name",
    label: "Bill Name",
    sortable: true,
    sortLevel: 2,
    sortDirection: "asc",
    datafieldKey: "billName",
    type: "alpha",
  },
  {
    id: "amt",
    label: "Amount",
    sortable: true,
    datafieldKey: "amount",
    sortDirection: "desc",
    sortLevel: 3,
    type: "amount",
  },
  { id: "ctgr", label: "Category", sortable: false },
  // { id: "vrfd", label: "Verified", sortable: false },
  { id: "tags", label: "Tags", sortable: false },
  { id: "actions", label: "Actions", sortable: false },
];

export type HeaderStateType = { [K in keyof ExpenseFields]?: SortableHeader };

export type ExpenseSortStateType = { [K in keyof ExpenseFields]?: ExpenseSortDetails };
