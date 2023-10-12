import "./navbar.css";
import { useState, FunctionComponent, useEffect } from "react";
import { faCalculator, faMoneyBill, faBank, faGears, faUserPlus, faSignInAlt, faSignOut } from "@fortawesome/free-solid-svg-icons";
import NavBarItem, { NavbarItemProp } from "./navbar-item";
import { PAGE_URL } from "./page-url";
import { useAuth } from "../../../auth";
import { useLocation } from "react-router-dom";


const items: NavbarItemProp[] = [
    { link: PAGE_URL.expenseJournalRoot.fullUrl, label: "Expenses", icon: faMoneyBill, id: "expenses", isProtected: true, isSelected: false },
    { link: PAGE_URL.pymtAccountsRoot.fullUrl, label: "Accounts", icon: faBank, id: "accounts", isProtected: true, isSelected: false },
    { link: PAGE_URL.settingsRoot.fullUrl, label: "Settings", icon: faGears, id: "settings", isProtected: true, isSelected: false },
    { link: PAGE_URL.signupPage.fullUrl, label: "Signup", icon: faUserPlus, id: "signup", isProtected: false, isSelected: false },
    { link: PAGE_URL.loginPage.fullUrl, label: "Login", icon: faSignInAlt, id: "Login", isProtected: false, isSelected: false },
];

const NavBar: FunctionComponent = () => {
    const [isActive, setActive] = useState(false);
    const [navbarItems, setNavbarItems] = useState<NavbarItemProp[]>([]);
    const auth = useAuth();
    const { pathname } = useLocation();

    useEffect(() => {
        console.debug("if auth status changes", auth.isAuthenticated,
            "navbar items: ", navbarItems,
            "len=", navbarItems.length,
            "is 0?", (!navbarItems.length),
            "first item protected?", navbarItems.length > 0 ? navbarItems[0].isProtected : "NA",
            "protected same as previous?", navbarItems.length > 0 ? navbarItems[0].isProtected !== auth.isAuthenticated : "NA",
        );
        let navbarItemlist = navbarItems;
        if (!navbarItems.length || navbarItems[0].isProtected !== auth.isAuthenticated) {
            navbarItemlist = items
                .filter(item => (auth.isAuthenticated === item.isProtected))
                .map(item => ({ ...item }));
            console.debug("setting new navbar list", navbarItemlist);
            // setNavbarItems([...navbarItemlist]);
        }
        console.debug("pathname: ", pathname, "navbaritems", navbarItemlist);
        let selectedNavbarItem = navbarItemlist.find(item => pathname === item.link);
        if (pathname === "/") {
            selectedNavbarItem = undefined;
            const list: NavbarItemProp[] = [];
            let isPreviouslySelected = false;
            navbarItemlist.forEach(item => {
                list.push({
                    ...item,
                    isSelected: false
                });
                isPreviouslySelected = isPreviouslySelected || item.isSelected;
            });
            console.debug("isPreviouslySelected = updating navbaritems?", isPreviouslySelected, "navbaritems", list);
            if (isPreviouslySelected) navbarItemlist = [...list];
            // if (isPreviouslySelected) setNavbarItems([...list]);
        } else if (!selectedNavbarItem) {
            selectedNavbarItem = navbarItemlist.find(item => pathname.startsWith(item.link));
        }
        console.debug("selectedNavbarItem", selectedNavbarItem);
        if (selectedNavbarItem) {
            if (!selectedNavbarItem.isSelected) {
                const list: NavbarItemProp[] = [];
                navbarItemlist.forEach(item => {
                    if (item.id === selectedNavbarItem?.id) {
                        list.push({
                            ...item,
                            isSelected: true
                        });
                    } else if (item.isSelected) {
                        list.push({
                            ...item,
                            isSelected: false
                        });
                    } else {
                        list.push(item);
                    }
                });
                console.debug("selected navbaritem is not selected, so setting selected and updating navbaritems", list);
                // setNavbarItems([...list]);
                navbarItemlist = [...list];
            }
        }
        if (navbarItemlist !== navbarItems) {
            setNavbarItems(navbarItemlist);
        }
    }, [pathname, navbarItems, auth.isAuthenticated]);

    const toggleNavbar: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        setActive(!isActive);
    };

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
                        isSelected={ pathname === "/" }
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
                                    isSelected={ itemProp.isSelected }
                                />
                            )
                        }
                    </div>
                    {
                        auth.isAuthenticated &&
                        <div className="navbar-end">
                            {
                                <NavBarItem
                                    icon={ faSignOut }
                                    label="Logout"
                                    link="/logout"
                                    id="logout"
                                    key="logout"
                                    isProtected={ true }
                                    isSelected={ false }
                                />
                            }
                        </div>
                    }
                </div>
            </nav>
        </section>
    );
};

export default NavBar;
