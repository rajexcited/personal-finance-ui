import { FunctionComponent, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import ExpenseForm from "./expense-form";
import { ExpenseContext, ExpenseFields } from "../store";
import { ExpenseService } from "../services";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const expenseService = await ExpenseService();

export interface UpdateExpenseProps {
}

const UpdateExpense: FunctionComponent<UpdateExpenseProps> = () => {
    const context = useContext(ExpenseContext);
    const { expenseId } = useParams();
    const [expenseDetail, setExpenseDetail] = useState<ExpenseFields>();
    const [errorMsg, setErrorMsg] = useState('');
    console.log("update expense component");

    useEffect(() => {
        console.log("in useeffect for update expense");
        const getExpense = async (expenseId: string) => {
            const expense = await expenseService.getExpense(expenseId);
            if (!expense) {
                throw new Error("there is no expense found to update");
            }
            setExpenseDetail(expense);
        };
        if (expenseId) getExpense(expenseId).catch(err => setErrorMsg(err.message)).finally(() => { console.log("in finally of get expense for update expense"); });
    }, []);

    const onExpenseUpdated = (data: ExpenseFields) => {
        console.log("expense updated", data);
        context.onUpdateExpense(data);
    };

    console.log("context: ", context);
    const errorMessage = errorMsg || context.errorMessage;

    return (
        <div className="columns">
            <div className="column">
                {
                    errorMessage &&
                    <article className="message is-danger">
                        <div className="message-header">
                            <p>Oops!</p>
                        </div>
                        <div className="message-body">
                            { errorMessage }
                        </div>
                    </article>
                }
                {
                    !expenseDetail && !errorMessage &&
                    <div className="columns is-centered py-5 my-5">
                        <div className="column is-1">
                            <span className="icon is-large">
                                <FontAwesomeIcon icon={ faSpinner } className="fa-pulse" />
                            </span>
                        </div>
                    </div>
                }
                {
                    expenseDetail &&
                    <ExpenseForm
                        key="update-expense-form"
                        expenseId={ expenseDetail.expenseId }
                        submitLabel="Update"
                        onSubmit={ onExpenseUpdated }
                        details={ expenseDetail }
                    />
                }
            </div>
        </div>
    );
};

export default UpdateExpense;