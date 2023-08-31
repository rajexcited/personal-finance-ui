import { FunctionComponent, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PAGE_URL } from "../page-url";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import ExpenseForm from "./expense-form";
import { v4 as uuidv4 } from "uuid";
import { ExpenseContext, ExpenseData } from "./expense-context";
import ExpenseService from "./expenses-service";

const expenseService = await ExpenseService();
export interface AddExpenseProps {
}

const AddExpense: FunctionComponent<AddExpenseProps> = () => {
    const navigate = useNavigate();
    const expenses = useContext(ExpenseContext);
    const [expenseId, setExpenseId] = useState(uuidv4());

    const onExpenseAdded = (data: ExpenseData) => {
        console.log("expense added", data);
        expenses.push(data);
        expenseService.addExpense(data);
        setTimeout(() => {
            navigate(PAGE_URL.expenseJournal.fullUrl);
        }, 300);
    };

    return (
        <ExpenseContext.Provider value={ expenses }>
            <div className="columns">
                <div className="column">
                    <ExpenseForm
                        key="add-expense-form"
                        expenseId={ expenseId }
                        submitLabel="Add"
                        onSubmit={ onExpenseAdded }
                    />
                </div>
            </div>
        </ExpenseContext.Provider>
    );
};

export default AddExpense;