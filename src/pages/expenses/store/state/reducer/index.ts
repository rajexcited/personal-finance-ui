import { ActionType, ExpenseAction } from "../actions";
import { ExpenseFields } from "../../../services/field-types";
import { ExpenseState } from "./expense-state";
import { expenseComparator } from "../../../services/sort-comparator";

export const defaultExpenseState: ExpenseState = {
  expenses: [],
  filters: [],
  sortDetails: {},
  loading: false,
  errorMessage: undefined,
};

const getSortedExpenses = (expenseState: ExpenseState): ExpenseFields[] => {
  const expenses = [...expenseState.expenses];
  expenses.sort(expenseComparator.bind(null, expenseState.sortDetails));
  return expenses;
};

const reducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case ActionType.LOADING_EXPENSES: {
      return { ...state, loading: action.loading, errorMessage: action.errorMessage };
    }
    case ActionType.ERROR_RESULT: {
      return { ...state, loading: action.loading, errorMessage: action.errorMessage };
    }
    case ActionType.ADD_EXPENSE: {
      const sortedExpenses = getSortedExpenses({ ...state, expenses: [...state.expenses, action.expense] });
      return { ...state, expenses: sortedExpenses, loading: action.loading, errorMessage: action.errorMessage };
    }

    case ActionType.UPDATE_EXPENSE: {
      const updatedExpenseItemIndex = state.expenses.findIndex((item) => item.expenseId === action.expense.expenseId);
      const updatedExpenses = [...state.expenses];
      if (updatedExpenseItemIndex != -1) {
        updatedExpenses[updatedExpenseItemIndex] = action.expense;
      }
      const sortedExpenses = getSortedExpenses({ ...state, expenses: updatedExpenses });
      return { ...state, expenses: sortedExpenses, loading: action.loading, errorMessage: action.errorMessage };
    }

    case ActionType.REMOVE_EXPENSE: {
      const updatedExpenses = state.expenses.filter((item) => item.expenseId !== action.expenseId);
      const sortedExpenses = getSortedExpenses({ ...state, expenses: updatedExpenses });
      return { ...state, expenses: [...sortedExpenses], loading: action.loading, errorMessage: action.errorMessage };
    }

    case ActionType.EXPENSE_FILTER_ADD: {
      return {
        ...state,
        filters: [...state.filters, action.filter],
        loading: action.loading,
        errorMessage: action.errorMessage,
      };
    }

    case ActionType.EXPENSE_FILTER_UPDATE: {
      const updatedFilterItemIndex = state.filters.findIndex((item) => item.fieldName === action.filter.fieldName);
      const updatedFilters = [...state.filters];
      if (updatedFilterItemIndex != -1) {
        updatedFilters[updatedFilterItemIndex] = action.filter;
      }
      return { ...state, filters: updatedFilters, loading: action.loading, errorMessage: action.errorMessage };
    }

    case ActionType.EXPENSE_FILTER_REMOVE: {
      const updatedFilters = state.filters.filter((item) => item.fieldName !== action.filter.fieldName);
      return { ...state, filters: [...updatedFilters], loading: action.loading, errorMessage: action.errorMessage };
    }

    case ActionType.INIT_EXPENSES: {
      const initialState = {
        ...state,
        expenses: [...action.expenses],
        filters: [...action.filters],
        sortDetails: { ...action.sortDetails },
      };
      const sortedExpenses = getSortedExpenses(initialState);
      return { ...initialState, expenses: sortedExpenses, loading: action.loading, errorMessage: action.errorMessage };
    }

    case ActionType.EXPENSE_SORT_UPDATE: {
      const updatedSortDetails = { ...state.sortDetails };
      const updatedSortDetail = { ...action.sortDetail };
      updatedSortDetails[updatedSortDetail.datafieldKey] = updatedSortDetail;

      const sortedExpenses = getSortedExpenses({ ...state, sortDetails: updatedSortDetails });
      return {
        ...state,
        sortDetails: updatedSortDetails,
        expenses: [...sortedExpenses],
        loading: action.loading,
        errorMessage: action.errorMessage,
      };
    }

    default:
      return state;
  }
};

export default reducer;
export type { ExpenseState };
export type { Header, HeaderStateType, ExpenseSortDetails, ExpenseSortStateType } from "../../../services/sort-headers";
export { expenseComparator } from "../../../services/sort-comparator";
export { rowHeaders } from "../../../services/sort-headers";
