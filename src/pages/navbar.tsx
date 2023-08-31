import { useState, FunctionComponent } from "react";
import { faCalculator, faMoneyBill, faBank } from "@fortawesome/free-solid-svg-icons";
import NavBarItem, { NavbarItemProp } from "./navbar-item";
import { PAGE_URL } from "./page-url";

const items: NavbarItemProp[] = [
    { link: PAGE_URL.expenseJournal.fullUrl, label: "Expenses", icon: faMoneyBill, id: "expenses" },
    { link: PAGE_URL.accounts.fullUrl, label: "Accounts", icon: faBank, id: "accounts" }
]

const NavBar: FunctionComponent = () => {
    const [isActive, setActive] = useState(false);
    const toggleNavbar: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        setActive(!isActive);
    };

    return (
        <section className="container">
            <nav className="navbar has-shadow is-white">
                <div className="navbar-brand">
                    <NavBarItem
                        icon={faCalculator}
                        label="Personal Finance"
                        link="/"
                        id="brandfinance"
                        key={"brandfinance"}
                    />
                    <a href="#/" className="navbar-burger" onClick={toggleNavbar}>
                        {items.map(() => <span></span>)}
                    </a>
                </div>
                <div className={`navbar-menu ${isActive ? "is-active" : ""}`}>
                    <div className="navbar-start">
                        {
                            items.map(itemProp =>
                                <NavBarItem
                                    icon={itemProp.icon}
                                    label={itemProp.label}
                                    link={itemProp.link}
                                    id={itemProp.id}
                                    key={itemProp.id}
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
