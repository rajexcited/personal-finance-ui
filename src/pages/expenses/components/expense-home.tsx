import { FunctionComponent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getFullPath } from "../../root";


export const ExpenseJournalPage: FunctionComponent = () => {
    const navigate = useNavigate();

    const onClickNavigateAddPurchaseHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        navigate(getFullPath("addPurchase"));
    };
    const onClickNavigateAddIncomeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        // navigate(getFullPath("addPurchase"));
    };
    const onClickNavigateAddInvestmentHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        // navigate(getFullPath("addPurchase"));
    };

    return (
        <>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        <button className="button is-link" onClick={ onClickNavigateAddPurchaseHandler }>Add Purchase</button>
                        <button className="button is-link" onClick={ onClickNavigateAddIncomeHandler }>Add Income</button>
                        <button className="button is-link" onClick={ onClickNavigateAddInvestmentHandler }>Add Investment</button>
                    </div>
                </div>
            </div>
            <section className="section is-narrow-y">
                <Outlet />
            </section>
        </>
    );
};

