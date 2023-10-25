import { FunctionComponent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { PAGE_URL } from "../../root";


const AccountsHome: FunctionComponent = () => {
    const navigate = useNavigate();

    const onClickNavigateAddPymtAccountHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        navigate(PAGE_URL.addPymAccount.shortUrl);
    };

    return (
        <>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        <button className="button is-link" onClick={ onClickNavigateAddPymtAccountHandler }>Add Account</button>
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