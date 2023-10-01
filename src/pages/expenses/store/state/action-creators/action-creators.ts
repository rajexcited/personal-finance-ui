import {
  ActionType,
  AddExpenseAction,
  FilterExpensesAction,
  InitExpensesAction,
  RemoveExpenseAction,
  UpdateExpenseAction,
  UpdateSortExpensesAction,
  ExpenseLoadingAction,
  ErrorExpenseAction,
} from "../actions";
import { ExpenseFields, ExpenseFilterType } from "../field-types";
import { ExpenseSortDetails, ExpenseSortStateType } from "../reducer/sort-headers";

export const loadExpense = (): ExpenseLoadingAction => {
  return {
    type: ActionType.LOADING_EXPENSES,
    errorMessage: undefined,
    loading: true,
  };
};

export const foundErrorForExpense = (errorMessage: string): ErrorExpenseAction => {
  return {
    type: ActionType.ERROR_RESULT,
    errorMessage,
    loading: false,
  };
};

export const addExpense = (expense: ExpenseFields): AddExpenseAction => {
  return {
    type: ActionType.ADD_EXPENSE,
    expense,
    errorMessage: undefined,
    loading: false,
  };
};

export const updateExpense = (expense: ExpenseFields): UpdateExpenseAction => {
  return {
    type: ActionType.UPDATE_EXPENSE,
    expense,
    errorMessage: undefined,
    loading: false,
  };
};

export const removeExpense = (expenseId: string): RemoveExpenseAction => {
  return {
    type: ActionType.REMOVE_EXPENSE,
    expenseId,
    errorMessage: undefined,
    loading: false,
  };
};

export const addExpenseFilter = (filter: ExpenseFilterType): FilterExpensesAction => {
  return {
    type: ActionType.EXPENSE_FILTER_ADD,
    filter,
    errorMessage: undefined,
    loading: false,
  };
};

export const removeExpenseFilter = (filter: ExpenseFilterType): FilterExpensesAction => {
  return {
    type: ActionType.EXPENSE_FILTER_REMOVE,
    filter,
    errorMessage: undefined,
    loading: false,
  };
};

export const updateExpenseFilter = (filter: ExpenseFilterType): FilterExpensesAction => {
  return {
    type: ActionType.EXPENSE_FILTER_UPDATE,
    filter,
    errorMessage: undefined,
    loading: false,
  };
};

export const updateExpenseSort = (sortDetail: ExpenseSortDetails): UpdateSortExpensesAction => {
  return {
    type: ActionType.EXPENSE_SORT_UPDATE,
    sortDetail,
    errorMessage: undefined,
    loading: false,
  };
};

export const initializeExpenses = (
  expenses: ExpenseFields[],
  filters: ExpenseFilterType[],
  sortDetails: ExpenseSortStateType
): InitExpensesAction => {
  return {
    type: ActionType.INIT_EXPENSES,
    expenses,
    filters,
    sortDetails,
    errorMessage: undefined,
    loading: false,
  };
};
