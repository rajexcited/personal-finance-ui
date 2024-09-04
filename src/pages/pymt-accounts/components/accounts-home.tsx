import { FunctionComponent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getFullPath } from "../../root";


const AccountsHome: FunctionComponent = () => {
    const navigate = useNavigate();

    const onClickNavigateAddPymtAccountHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        navigate(getFullPath("addPymAccount"));
    };

    const onClickNavigateAddNriTransferHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        // navigate(getFullPath("addPurchase"));
    };

    return (
        <>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        <button className="button is-link" onClick={ onClickNavigateAddPymtAccountHandler }>Add Account</button>
                        <button className="button is-link" onClick={ onClickNavigateAddNriTransferHandler }>Add Transfer</button>
                    </div>
                </div>
            </div>
            <section className="section is-narrow-y">
                <Outlet />
            </section>
        </>
    );
};

export default AccountsHome;