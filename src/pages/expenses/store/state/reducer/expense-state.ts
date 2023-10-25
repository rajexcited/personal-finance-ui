import { ExpenseFields, ExpenseFilterType } from "../../../services/field-types";
import { ExpenseSortStateType } from "../../../services/sort-headers";

export interface ExpenseState {
  expenses: ExpenseFields[];
  filters: ExpenseFilterType[];
  sortDetails: ExpenseSortStateType;
  loading: boolean;
  errorMessage: string | undefined;
}
