import { FunctionComponent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getFullPath } from "../../root";
import { useAuth } from "../../auth";


export const ExpenseJournalPage: FunctionComponent = () => {
    const navigate = useNavigate();
    const auth = useAuth();

    const onClickNavigateAddPurchaseHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (!auth.readOnly) {
            navigate(getFullPath("addPurchase"));
        }
    };
    const onClickNavigateAddIncomeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (!auth.readOnly) {
            navigate(getFullPath("addIncome"));
        }
    };

    // const onClickNavigateAddInvestmentHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    //     event.preventDefault();
    //     navigate(getFullPath("addPurchase"));
    // };

    const onClickNavigateAddPurchaseRefundHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (!auth.readOnly) {
            navigate(getFullPath("addPurchaseRefund", "unknown"));
        }
    };

    return (
        <>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        <button className="button is-link" onClick={ onClickNavigateAddPurchaseHandler } disabled={ auth.readOnly } >Add Purchase</button>
                        <button className="button is-link" onClick={ onClickNavigateAddIncomeHandler } disabled={ auth.readOnly }>Add Income</button>
                        {/* <button className="button is-link" onClick={ onClickNavigateAddInvestmentHandler }>Add Investment</button> */ }
                        <button className="button is-link" onClick={ onClickNavigateAddPurchaseRefundHandler } disabled={ auth.readOnly } >Add Refund</button>
                    </div>
                </div>
            </div>
            <section className="section is-narrow-y">
                <Outlet />
            </section>
        </>
    );
};

