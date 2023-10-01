import { ExpenseFields, ExpenseFilterType } from "../field-types";
import { ExpenseSortDetails, ExpenseSortStateType } from "../reducer/sort-headers";

export enum ActionType {
  ADD_EXPENSE = "add_expense",
  UPDATE_EXPENSE = "update_expense",
  REMOVE_EXPENSE = "remove_expense",
  EXPENSE_FILTER_ADD = "add_expense_filter",
  EXPENSE_FILTER_UPDATE = "update_expense_filter",
  EXPENSE_FILTER_REMOVE = "remove_expense_filter",
  EXPENSE_SORT_UPDATE = "update_expense_sort",
  INIT_EXPENSES = "initialize_expenses_filters",
  LOADING_EXPENSES = "loading",
  ERROR_RESULT = "error_result",
}

export interface AddExpenseAction {
  type: ActionType.ADD_EXPENSE;
  expense: ExpenseFields;
  loading: false;
  errorMessage: undefined;
}

export interface UpdateExpenseAction {
  type: ActionType.UPDATE_EXPENSE;
  expense: ExpenseFields;
  loading: false;
  errorMessage: undefined;
}

export interface RemoveExpenseAction {
  type: ActionType.REMOVE_EXPENSE;
  expenseId: string;
  loading: false;
  errorMessage: undefined;
}

export interface UpdateSortExpensesAction {
  type: ActionType.EXPENSE_SORT_UPDATE;
  sortDetail: ExpenseSortDetails;
  loading: false;
  errorMessage: undefined;
}

export interface FilterExpensesAction {
  type: ActionType.EXPENSE_FILTER_UPDATE | ActionType.EXPENSE_FILTER_ADD | ActionType.EXPENSE_FILTER_REMOVE;
  filter: ExpenseFilterType;
  loading: false;
  errorMessage: undefined;
}

export interface InitExpensesAction {
  type: ActionType.INIT_EXPENSES;
  expenses: ExpenseFields[];
  filters: ExpenseFilterType[];
  sortDetails: ExpenseSortStateType;
  loading: false;
  errorMessage: undefined;
}

export interface ExpenseLoadingAction {
  type: ActionType.LOADING_EXPENSES;
  loading: true;
  errorMessage: undefined;
}

export interface ErrorExpenseAction {
  type: ActionType.ERROR_RESULT;
  loading: false;
  errorMessage: string;
}

export type ExpenseAction =
  | AddExpenseAction
  | UpdateExpenseAction
  | RemoveExpenseAction
  | FilterExpensesAction
  | UpdateSortExpensesAction
  | InitExpensesAction
  | ExpenseLoadingAction
  | ErrorExpenseAction;
