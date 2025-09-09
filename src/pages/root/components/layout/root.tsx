import "./root.css";
import { FunctionComponent } from "react";
import { Outlet, useLocation, useNavigation } from "react-router";
import { faBank, faDashboard, faGears, faMoneyBills, faSignIn, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getFullPath, NavBar } from "../navigation";
import { LoadSpinner } from "../../../../components";
import { isDemo } from "../../../../demo";
import { getLogger } from "../../services";

const expenseJournalRoot = getFullPath("expenseJournalRoot");
const pymtAccountsRoot = getFullPath("pymtAccountsRoot");
const settingsRoot = getFullPath("settingsRoot");
const loginPage = getFullPath("loginPage");
const signupPage = getFullPath("signupPage");

const fcLogger = getLogger("FC.RootLayout", null, null, "DISABLED");
const RootLayout: FunctionComponent = () => {
    const navigation = useNavigation();
    const isLoading = navigation.state !== "idle";
    const location = useLocation();
    let title = "Home";
    let icon = faDashboard;
    fcLogger.debug("in root layout", "location.pathname =", location.pathname, "location =", location, "navigation =", navigation);

    if (location.pathname.startsWith(expenseJournalRoot)) {
        title = "Manage Expenses";
        icon = faMoneyBills;
    } else if (location.pathname.startsWith(pymtAccountsRoot)) {
        title = "Manage Payment Accounts";
        icon = faBank;
    } else if (location.pathname.startsWith(settingsRoot)) {
        title = "Manage Settings";
        icon = faGears;
    } else if (location.pathname.startsWith(loginPage)) {
        title = "User Login";
        icon = faSignIn;
    } else if (location.pathname.startsWith(signupPage)) {
        title = "User Sign up";
        icon = faUserPlus;
    }

    return (
        <div className="section">
            <div className="columns">
                <div className="column is-1">
                    {
                        isDemo &&
                        <div className="demo logo"><figure className="icon"></figure></div>
                    }
                </div>
                <div className="column mt-3 has-text-centered">
                    <h2 className="title page-title">
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
            <LoadSpinner loading={ isLoading } id="page-route" />

            <section className="root-route-child section is-px-0-mobile">
                <Outlet />
            </section>
        </div>
    );
};

export default RootLayout;