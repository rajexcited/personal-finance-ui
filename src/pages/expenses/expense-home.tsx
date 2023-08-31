import { FunctionComponent } from "react";
import { Outlet, useNavigate } from "react-router-dom"
import { PAGE_URL } from "../page-url";

const ExpenseJournalPage: FunctionComponent = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        <button className="button is-link" onClick={() => navigate(PAGE_URL.addExpense.shortUrl)}>Add Expense</button>
                        <button className="button is-link" onClick={() => navigate(PAGE_URL.addReceipt.shortUrl)}>Add Receipt</button>
                    </div>
                </div>
            </div>
            <section className="section">
                <Outlet />
            </section>
        </>
    );
};

export default ExpenseJournalPage;