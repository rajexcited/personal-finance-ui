import { FunctionComponent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { PAGE_URL } from "../../navigation/page-url";


const AccountsHome: FunctionComponent = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="columns">
                <div className="column">
                    <div className="buttons">
                        <button className="button is-link" onClick={ () => navigate(PAGE_URL.addPymAccount.shortUrl) }>Add Account</button>
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