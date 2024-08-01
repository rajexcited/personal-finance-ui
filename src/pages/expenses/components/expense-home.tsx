import { FunctionComponent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getFullPath } from "../../root";



const ExpenseJournalPage: FunctionComponent = () => {
    const navigate = useNavigate();

    const onClickNavigateAddExpenseHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        navigate(getFullPath("addExpense"));
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
            <section className="section is-narrow-y">
                <Outlet />
            </section>
        </>
    );
};

export default ExpenseJournalPage;