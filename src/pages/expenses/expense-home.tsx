import { FunctionComponent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { PAGE_URL } from "../root/navigation";
import { ExpenseContextProvider } from "./store/context";

const ExpenseJournalPage: FunctionComponent = () => {
    const navigate = useNavigate();

    const onClickNavigateAddExpenseHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        navigate(PAGE_URL.addExpense.shortUrl);
    };

    return (
        <>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        <button className="button is-link" onClick={ onClickNavigateAddExpenseHandler }>Add Expense</button>
                    </div>
                </div>
            </div>
            <section className="container p-3 my-2">
                <ExpenseContextProvider>
                    <Outlet />
                </ExpenseContextProvider>
            </section>
        </>
    );
};

export default ExpenseJournalPage;