import "./root.css";
import { FunctionComponent } from "react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { faBank, faDashboard, faGears, faMoneyBills, faSignIn, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavBar, PAGE_URL } from "../navigation";
import { LoadSpinner } from "../../../../components";
import axiosMock from "../../../../demo";

const RootLayout: FunctionComponent = () => {
    const navigation = useNavigation();
    const isLoading = navigation.state !== "idle";
    const location = useLocation();
    let title = "Home";
    let icon = faDashboard;
    // logger.log("in root layout", "location.pathname =", location.pathname, "location =", location, "navigation =", navigation);

    if (location.pathname.startsWith(PAGE_URL.expenseJournalRoot.fullUrl)) {
        title = "Manage Expenses";
        icon = faMoneyBills;
    } else if (location.pathname.startsWith(PAGE_URL.pymtAccountsRoot.fullUrl)) {
        title = "Manage Payment Accounts";
        icon = faBank;
    } else if (location.pathname.startsWith(PAGE_URL.settingsRoot.fullUrl)) {
        title = "Manage Settings";
        icon = faGears;
    } else if (location.pathname.startsWith(PAGE_URL.loginPage.fullUrl)) {
        title = "User Login";
        icon = faSignIn;
    } else if (location.pathname.startsWith(PAGE_URL.signupPage.fullUrl)) {
        title = "User Sign up";
        icon = faUserPlus;
    }

    return (
        <div className="section">
            <div className="columns">
                <div className="column is-1">
                    {
                        !axiosMock.history.isDummy &&
                        <div className="demo logo"><figure className="icon"></figure></div>
                    }
                </div>
                <div className="column mt-3 has-text-centered">
                    <h2 className="title is-1">
                        <span className="icon-text">
                            <span className="icon">
                                <FontAwesomeIcon icon={ icon } />
                            </span>
                            <span>&nbsp;{ title }</span>
                        </span>
                    </h2>
                </div>
            </div>

            <NavBar />
            <LoadSpinner loading={ isLoading } />

            <section className="root-route-child">
                <Outlet />
            </section>
        </div>
    );
};

export default RootLayout;