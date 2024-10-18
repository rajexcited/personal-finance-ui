import { FunctionComponent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getFullPath } from "../../root";
import { useAuth } from "../../auth";


const AccountsHome: FunctionComponent = () => {
    const navigate = useNavigate();
    const auth = useAuth();

    const onClickNavigateAddPymtAccountHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        if (!auth.readOnly) {
            navigate(getFullPath("addPymAccount"));
        }
    };

    return (
        <>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        <button className="button is-link" onClick={ onClickNavigateAddPymtAccountHandler } disabled={ auth.readOnly } >Add Account</button>
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