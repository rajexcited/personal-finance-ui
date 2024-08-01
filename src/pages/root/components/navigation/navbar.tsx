import "./navbar.css";
import { useState, FunctionComponent, useEffect } from "react";
import { faCalculator, faMoneyBill, faBank, faGears, faUserPlus, faSignInAlt, faSignOut } from "@fortawesome/free-solid-svg-icons";
import NavBarItem, { NavbarItemProp } from "./navbar-item";
import { getFullPath } from "./page-url";
import { useAuth } from "../../../auth";
import { useLocation } from "react-router-dom";


const items: NavbarItemProp[] = [
    { link: getFullPath("expenseJournalRoot"), label: "Expenses", icon: faMoneyBill, id: "expenses", isProtected: true, isSelected: false },
    { link: getFullPath("pymtAccountsRoot"), label: "Accounts", icon: faBank, id: "accounts", isProtected: true, isSelected: false },
    { link: getFullPath("settingsRoot"), label: "Settings", icon: faGears, id: "settings", isProtected: true, isSelected: false },
    { link: getFullPath("signupPage"), label: "Signup", icon: faUserPlus, id: "signup", isProtected: false, isSelected: false },
    { link: getFullPath("loginPage"), label: "Login", icon: faSignInAlt, id: "Login", isProtected: false, isSelected: false },
];

const NavBar: FunctionComponent = () => {
    const [isActive, setActive] = useState(false);
    const [navbarItems, setNavbarItems] = useState<NavbarItemProp[]>([]);
    const auth = useAuth();
    const { pathname } = useLocation();

    useEffect(() => {
        let navbarItemlist = navbarItems;
        if (!navbarItems.length || navbarItems[0].isProtected !== auth.userDetails.isAuthenticated) {
            navbarItemlist = items
                .filter(item => (auth.userDetails.isAuthenticated === item.isProtected))
                .map(item => ({ ...item }));
        }
        let selectedNavbarItem = navbarItemlist.find(item => pathname === item.link);
        if (pathname === getFullPath("rootPath")) {
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

            if (isPreviouslySelected) navbarItemlist = [...list];
            // if (isPreviouslySelected) setNavbarItems([...list]);
        } else if (!selectedNavbarItem) {
            selectedNavbarItem = navbarItemlist.find(item => pathname.startsWith(item.link));
        }

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
                navbarItemlist = [...list];
            }
        }
        if (navbarItemlist !== navbarItems) {
            setNavbarItems(navbarItemlist);
        }
    }, [pathname, navbarItems, auth.userDetails.isAuthenticated]);

    const toggleNavbar: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        setActive(!isActive);
    };

    const rootPath = getFullPath("rootPath");
    const logoutPage = getFullPath("logoutPage");

    return (
        <section className="container">
            <nav className="navbar has-shadow is-white">
                <div className="navbar-brand">
                    <NavBarItem
                        icon={ faCalculator }
                        label="Personal Finance"
                        link={ rootPath }
                        id="brandfinance"
                        key={ "brandfinance" }
                        isProtected={ false }
                        isSelected={ pathname === rootPath }
                    />
                    <a href={ "#" + rootPath } className="navbar-burger" onClick={ toggleNavbar }>
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
                        auth.userDetails.isAuthenticated &&
                        <div className="navbar-end">
                            {
                                <NavBarItem
                                    icon={ faSignOut }
                                    label="Logout"
                                    link={ logoutPage }
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
