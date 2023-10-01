import { ExpenseFields, ExpenseFilterType } from "../field-types";
import { ExpenseSortStateType } from "./sort-headers";

export interface ExpenseState {
  expenses: ExpenseFields[];
  filters: ExpenseFilterType[];
  sortDetails: ExpenseSortStateType;
  loading: boolean;
  errorMessage: string | undefined;
}
