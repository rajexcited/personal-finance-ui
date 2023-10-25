import { createContext } from "react";
import { ExpenseFields, ExpenseFilterType } from "../state";
import { ExpenseSortDetails, ExpenseSortStateType } from "../../services/sort-headers";

// create a filter component for th and similar to below link.
// each column has filter capability with actions.
// can use excel filter reference for design.  use `smart-array-filter` module to filter the data
// with that no need to have filter in home page. and can attach to TH
// https://www.ag-grid.com/react-data-grid/filtering/
export interface ExpenseContextType {
  expenses: ExpenseFields[];
  filters: ExpenseFilterType[];
  sortDetails: ExpenseSortStateType;
  loading: boolean;
  errorMessage: string | undefined;
  onAddFilter(filter: ExpenseFilterType): void;
  onUpdateFilter(filter: ExpenseFilterType): void;
  onRemoveFilter(filter: ExpenseFilterType): void;
  onAddExpense(expense: ExpenseFields): void;
  onUpdateExpense(expense: ExpenseFields): void;
  onRemoveExpense(expense: ExpenseFields): void;
  onChangeExpenseSort(sortDetail: ExpenseSortDetails): void;
  onInitExpenses(): void;
}

export const defaultExpenseContext: ExpenseContextType = {
  expenses: [],
  filters: [],
  sortDetails: {},
  loading: false,
  errorMessage: undefined,
  onAddFilter: (filter) => {},
  onUpdateFilter: (filter) => {},
  onRemoveFilter: (filter) => {},
  onAddExpense: (expense) => {},
  onUpdateExpense: (expense) => {},
  onRemoveExpense: (expense) => {},
  onChangeExpenseSort: (sortDetail) => {},
  onInitExpenses: () => {},
};

export const ExpenseContext = createContext<ExpenseContextType>(defaultExpenseContext);
