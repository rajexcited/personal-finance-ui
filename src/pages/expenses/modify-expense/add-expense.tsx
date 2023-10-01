import { FunctionComponent, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PAGE_URL } from "../../navigation/page-url";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import ExpenseForm from "./expense-form";
import { v4 as uuidv4 } from "uuid";
import { ExpenseContext, ExpenseFields } from "../store";


export interface AddExpenseProps {
}

const AddExpense: FunctionComponent<AddExpenseProps> = () => {
    const navigate = useNavigate();
    const context = useContext(ExpenseContext);
    const [expenseId, setExpenseId] = useState('');

    useEffect(() => {
        setExpenseId(uuidv4());
    }, []);

    const onExpenseAdded = (data: ExpenseFields) => {
        console.log("expense added", data);
        context.onAddExpense(data);
        setTimeout(() => {
            navigate(PAGE_URL.expenseJournalRoot.fullUrl);
        }, 300);
    };

    return (
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
    );
};

export default AddExpense;