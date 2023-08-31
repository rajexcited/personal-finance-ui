import { FunctionComponent, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { PAGE_URL } from "../page-url";

const AccountsHome: FunctionComponent = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        <button className="button is-link" onClick={ () => navigate(PAGE_URL.addAccount.shortUrl) }>Add Account</button>
                    </div>
                </div>
            </div>
            <section className="section">
                <Outlet />
            </section>
        </>
    );
};

export default AccountsHome;