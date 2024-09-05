import { SortDirection, SortType } from "../../../../components";
import { ExpenseFields } from "./field-types";

type AllKeys<T> = T extends any ? keyof T : never;
export type ExpenseSortFieldKey = AllKeys<ExpenseFields>;
export interface ExpenseSortDetails {
  sortable: true;
  sortLevel?: number;
  datafieldKey: ExpenseSortFieldKey;
  relatedDatafieldKeys: ExpenseSortFieldKey[];
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
  { id: "belongsTo", label: "Type", sortable: true, datafieldKey: "belongsTo", relatedDatafieldKeys: [] },
  {
    id: "xpns-dt",
    label: "Expense Date",
    sortable: true,
    datafieldKey: "purchasedDate",
    relatedDatafieldKeys: ["incomeDate", "refundDate", "purchasedDate"],
  },
  { id: "pymt-acc", label: "Payment Account", sortable: true, datafieldKey: "paymentAccountName", relatedDatafieldKeys: [] },
  {
    id: "bill-name",
    label: "Bill Name",
    sortable: true,
    sortLevel: 2,
    sortDirection: "asc",
    datafieldKey: "billName",
    relatedDatafieldKeys: [],
    type: "alpha",
  },
  {
    id: "amt",
    label: "Amount",
    sortable: true,
    datafieldKey: "amount",
    relatedDatafieldKeys: [],
    sortDirection: "desc",
    sortLevel: 3,
    type: "amount",
  },
  { id: "ctgr", label: "Category", sortable: false },
  // { id: "vrfd", label: "Verified", sortable: false },
  { id: "tags", label: "Tags", sortable: false },
  { id: "actions", label: "Actions", sortable: false },
];

export type HeaderStateType = { [K in ExpenseSortFieldKey]?: SortableHeader };

export type ExpenseSortStateType = { [K in ExpenseSortFieldKey]?: ExpenseSortDetails };
