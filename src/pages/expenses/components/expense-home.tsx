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
    const onClickNavigateAddNriTransferHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        // navigate(getFullPath("addPurchase"));
    };
    const onClickNavigateAddPurchaseRefundHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        navigate(getFullPath("addPurchaseRefund", "unknown"));
    };

    return (
        <>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        <button className="button is-link" onClick={ onClickNavigateAddPurchaseHandler }>Add Purchase</button>
                        <button className="button is-link" onClick={ onClickNavigateAddIncomeHandler }>Add Income</button>
                        <button className="button is-link" onClick={ onClickNavigateAddInvestmentHandler }>Add Investment</button>
                        <button className="button is-link" onClick={ onClickNavigateAddPurchaseRefundHandler }>Add Purchase Refund</button>
                        <button className="button is-link" onClick={ onClickNavigateAddNriTransferHandler }>Add NRI Transfer</button>
                    </div>
                </div>
            </div>
            <section className="section is-narrow-y">
                <Outlet />
            </section>
        </>
    );
};

