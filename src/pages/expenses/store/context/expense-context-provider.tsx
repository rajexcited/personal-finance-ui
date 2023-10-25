import { FunctionComponent, useReducer } from "react";
import { PAGE_URL } from "../../../root/components/navigation";
import { ExpenseContext } from "./expense-context";
import { reducer, defaultExpenseState, ExpenseSortDetails, HeaderStateType, ExpenseFilterType, ExpenseFields } from "../state";
import {
    addExpense,
    addExpenseFilter,
    removeExpense,
    removeExpenseFilter,
    updateExpense,
    updateExpenseFilter,
    initializeExpenses,
    updateExpenseSort
} from "../state/action-creators";
import ExpenseService from "../../services/expenses-service";
import { foundErrorForExpense, loadExpense } from "../state/action-creators/action-creators";
import { useNavigate } from "react-router-dom";
import { rowHeaders } from "../../services/sort-headers";



const expenseService = ExpenseService();

interface ExpenseContextProviderProps {
    children: JSX.Element;
}

const ExpenseContextProvider: FunctionComponent<ExpenseContextProviderProps> = (props) => {
    const navigate = useNavigate();
    const [expenseState, dispatchExpenseAction] = useReducer(reducer, defaultExpenseState);

    const onAddFilterHandler = (filter: ExpenseFilterType) => {
        console.log("in onChangeFilterHandler, filter: ", filter);
        dispatchExpenseAction(addExpenseFilter(filter));
    };
    const onUpdateFilterHandler = (filter: ExpenseFilterType) => {
        console.log("in onChangeFilterHandler, filter: ", filter);
        dispatchExpenseAction(updateExpenseFilter(filter));
    };
    const onRemoveFilterHandler = (filter: ExpenseFilterType) => {
        console.log("in onChangeFilterHandler, filter: ", filter);
        dispatchExpenseAction(removeExpenseFilter(filter));
    };
    const onAddExpenseHandler = (expense: ExpenseFields) => {
        console.log("in onAddExpenseHandler, expense: ", expense);
        dispatchExpenseAction(loadExpense());
        expenseService.addUpdateExpense(expense)
            .then(() => {
                dispatchExpenseAction(addExpense(expense));
            }).catch(error => {
                dispatchExpenseAction(foundErrorForExpense(error.message));
            });
    };
    const onUpdateExpenseHandler = (expense: ExpenseFields) => {
        console.log("in onUpdateExpenseHandler, expense: ", expense);
        dispatchExpenseAction(loadExpense());
        expenseService.addUpdateExpense(expense)
            .then(() => {
                dispatchExpenseAction(updateExpense(expense));
                setTimeout(() => {
                    navigate(PAGE_URL.expenseJournalRoot.fullUrl);
                }, 100);
            }).catch(error => {
                dispatchExpenseAction(foundErrorForExpense(error.message));
            });
    };
    const onRemoveExpenseHandler = (expense: ExpenseFields) => {
        console.log("in onRemoveExpenseHandler, expense: ", expense);
        dispatchExpenseAction(loadExpense());
        expenseService.removeExpense(expense.expenseId)
            .then(() => {
                dispatchExpenseAction(removeExpense(expense.expenseId));
            }).catch(error => {
                dispatchExpenseAction(foundErrorForExpense(error.message));
            });
    };
    const onChangeExpenseSortHandler = (sortDetail: ExpenseSortDetails) => {
        console.log("in onChangeExpenseSortHandler, sortDetail: ", sortDetail);
        dispatchExpenseAction(loadExpense());
        setTimeout(() => {
            dispatchExpenseAction(updateExpenseSort(sortDetail));
        }, 100);
    };
    const onInitExpensesHandler = () => {
        console.log("in onInitExpensesHandler ");
        dispatchExpenseAction(loadExpense());
        expenseService.getExpenses()
            .then((response) => {
                // initialize header
                const newHdrState: HeaderStateType = {};
                rowHeaders.forEach(rh => {
                    if (rh.sortable && rh.sortLevel && rh.sortDirection) {
                        newHdrState[rh.datafieldKey] = rh;
                    }
                });
                dispatchExpenseAction(initializeExpenses([...response], [], { ...newHdrState }));
            })
            .catch(error => {
                dispatchExpenseAction(foundErrorForExpense(error.message));
            });
    };


    const context = {
        ...expenseState,
        onAddFilter: onAddFilterHandler,
        onUpdateFilter: onUpdateFilterHandler,
        onRemoveFilter: onRemoveFilterHandler,
        onAddExpense: onAddExpenseHandler,
        onUpdateExpense: onUpdateExpenseHandler,
        onRemoveExpense: onRemoveExpenseHandler,
        onInitExpenses: onInitExpensesHandler,
        onChangeExpenseSort: onChangeExpenseSortHandler,
    };

    return (
        <ExpenseContext.Provider value={ context }>
            { props.children }
        </ExpenseContext.Provider >
    );
};

export default ExpenseContextProvider;

