import { useState, FunctionComponent } from "react";
import { faCalculator, faMoneyBill, faBank, faGears, faUserPlus, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import NavBarItem, { NavbarItemProp } from "./navbar-item";
import { PAGE_URL } from "./page-url";
import { useAuth } from "../auth";


const items: NavbarItemProp[] = [
    { link: PAGE_URL.expenseJournalRoot.fullUrl, label: "Expenses", icon: faMoneyBill, id: "expenses", isProtected: true },
    { link: PAGE_URL.pymtAccountsRoot.fullUrl, label: "Accounts", icon: faBank, id: "accounts", isProtected: true },
    { link: PAGE_URL.settingsRoot.fullUrl, label: "Settings", icon: faGears, id: "settings", isProtected: true },
    { link: PAGE_URL.signupPage.fullUrl, label: "Signup", icon: faUserPlus, id: "signup", isProtected: false },
    { link: PAGE_URL.loginPage.fullUrl, label: "Login", icon: faSignInAlt, id: "Login", isProtected: false },
];

const NavBar: FunctionComponent = () => {
    const [isActive, setActive] = useState(false);
    const toggleNavbar: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        setActive(!isActive);
    };

    const auth = useAuth();
    const navbarItems = items.filter(item => (auth.isAuthenticated === item.isProtected));

    return (
        <section className="container">
            <nav className="navbar has-shadow is-white">
                <div className="navbar-brand">
                    <NavBarItem
                        icon={ faCalculator }
                        label="Personal Finance"
                        link="/"
                        id="brandfinance"
                        key={ "brandfinance" }
                        isProtected={ false }
                    />
                    <a href="#/" className="navbar-burger" onClick={ toggleNavbar }>
                        { navbarItems.map((itemProp) => <span key={ itemProp.id + "burger" }></span>) }
                    </a>
                </div>
                <div className={ `navbar-menu ${isActive ? "is-active" : ""}` }>
                    <div className="navbar-start">
                        {
                            navbarItems.map(itemProp =>
                                <NavBarItem
                                    icon={ itemProp.icon }
                                    label={ itemProp.label }
                                    link={ itemProp.link }
                                    id={ itemProp.id }
                                    key={ itemProp.id }
                                    isProtected={ itemProp.isProtected }
                                />
                            )
                        }
                    </div>
                </div>
            </nav>
        </section>
    );
};

export default NavBar;
