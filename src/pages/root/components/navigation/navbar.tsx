import "./navbar.css";
import { useState, FunctionComponent, useEffect } from "react";
import { faCalculator, faMoneyBill, faBank, faGears, faUserPlus, faSignInAlt, faSignOut } from "@fortawesome/free-solid-svg-icons";
import NavBarItem, { NavbarItemProp } from "./navbar-item";
import { getFullPath } from "./page-url";
import { useAuth } from "../../../auth";
import { useLocation } from "react-router";
import { DeviceMode, useOrientation } from "../../../../hooks";
import { TAB_HEADS as SettingsTabs } from "../../../settings/components/settings-root";
import { getLogger } from "../../services";
import { sleep } from "../../../../shared";

enum NavLinkId {
    Expenses = "expenses-navlink",
    PaymentAccounts = "payment-accounts-navlink",
    Settings = "settings-navlink",
    Signup = "signup-navlink",
    Login = "login-navlink",
    Logout = "logout-navlink"
}

const items: NavbarItemProp[] = [
    { link: getFullPath("expenseJournalRoot"), label: "Expenses", icon: faMoneyBill, id: NavLinkId.Expenses, isProtected: true, isSelected: false },
    { link: getFullPath("pymtAccountsRoot"), label: "Accounts", icon: faBank, id: NavLinkId.PaymentAccounts, isProtected: true, isSelected: false },
    { link: getFullPath("settingsRoot"), label: "Settings", icon: faGears, id: NavLinkId.Settings, isProtected: true, isSelected: false },
    { link: getFullPath("signupPage"), label: "Signup", icon: faUserPlus, id: NavLinkId.Signup, isProtected: false, isSelected: false },
    { link: getFullPath("loginPage"), label: "Login", icon: faSignInAlt, id: NavLinkId.Login, isProtected: false, isSelected: false },
];

type NavbarItemDropDownProp = NavbarItemProp & { dropdownItems?: NavbarItemProp[]; };

const fcLogger = getLogger("FC.NavBar", null, null, "DISABLED");

const NavBar: FunctionComponent = () => {
    const [isActive, setActive] = useState(false);
    const [navbarItems, setNavbarItems] = useState<NavbarItemDropDownProp[]>([]);
    const auth = useAuth();
    const { pathname } = useLocation();
    const { resultedDevice: deviceMode } = useOrientation(DeviceMode.Mobile);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[pathname, navbarItems, auth.userDetails.isAuthenticated, deviceMode]", fcLogger);
        logger.debug("in useEffect, updating navbar");
        let navbarItemlist = navbarItems;
        if (!navbarItems.length || navbarItems[0].isProtected !== auth.userDetails.isAuthenticated) {
            navbarItemlist = items
                .filter(item => (auth.userDetails.isAuthenticated === item.isProtected))
                .map(item => ({ ...item }));
            logger.debug("updated navbar item list because of auth mismatched");
        }
        if (auth.userDetails.isAuthenticated) {
            const settingsNavItem = navbarItemlist.find(ni => ni.id === NavLinkId.Settings);
            if (settingsNavItem) {
                if (deviceMode === DeviceMode.Mobile && !settingsNavItem.dropdownItems) {
                    settingsNavItem.dropdownItems = SettingsTabs.map(st => {
                        const subItem: NavbarItemProp = {
                            id: st.id + "-navlink",
                            icon: st.icon,
                            isProtected: true,
                            isSelected: false,
                            label: st.title,
                            link: st.url
                        };
                        return subItem;
                    });
                    navbarItemlist = [...navbarItemlist];
                    logger.debug("updated settings navbar with dropdown sub-items");
                } else if (deviceMode === DeviceMode.Desktop && settingsNavItem.dropdownItems) {
                    settingsNavItem.dropdownItems = undefined;
                    navbarItemlist = [...navbarItemlist];
                    logger.debug("updated settings navbar removing dropdown sub-items");
                }
            }
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

            logger.debug("for rootpath, resetted item list selection");

            if (isPreviouslySelected) {
                logger.debug("for rootpath, updating with reset selected item list");
                navbarItemlist = [...list];
            }
        } else if (!selectedNavbarItem) {
            logger.debug("navbar item with exact path not found, trying to find path startwith match");
            selectedNavbarItem = navbarItemlist.find(item => pathname.startsWith(item.link));
        }

        if (selectedNavbarItem) {
            if (!selectedNavbarItem.isSelected) {
                logger.debug("matching navbar item is not selected, so updating list with selection");
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
            const selectedItem = navbarItemlist.find(ni => ni.isSelected);
            if (selectedItem?.dropdownItems) {
                logger.debug("found dropdown items for selected navbar item, so updating dropdown item selection");
                const selectedDdItemmatched = selectedItem.dropdownItems.find(ddItem => ddItem.isSelected && ddItem.link === pathname);
                if (!selectedDdItemmatched) {
                    const newddItems: NavbarItemProp[] = selectedItem.dropdownItems.map(ddItem => ({
                        ...ddItem,
                        isSelected: ddItem.link === pathname
                    }));
                    selectedItem.dropdownItems = newddItems;
                    navbarItemlist = [...navbarItemlist];
                }
            }
            let hasDropDownUpdated = false;
            const updatedItems = navbarItemlist.map(ni => {
                if (ni.dropdownItems && !ni.isSelected) {
                    const dropdownItems = ni.dropdownItems.map(niddi => {
                        if (niddi.isSelected) {
                            hasDropDownUpdated = true;
                            return { ...niddi, isSelected: false };
                        }
                        return niddi;
                    });
                    return { ...ni, dropdownItems: dropdownItems };
                }
                return ni;
            });
            if (hasDropDownUpdated) {
                navbarItemlist = updatedItems;
            }
        }
        if (navbarItemlist !== navbarItems) {
            logger.debug("getting duplicate key react error, so printing all Id with label.",
                "level1=", navbarItemlist.map(ni => (ni.id + ";" + ni.label)),
                "level2=", navbarItemlist.filter(ni => !!ni.dropdownItems).flatMap(ni => ni.dropdownItems?.map(nddi => (nddi.id + ";" + nddi.label)))
            );
            setNavbarItems(navbarItemlist);
        }
    }, [pathname, navbarItems, auth.userDetails.isAuthenticated, deviceMode]);

    useEffect(() => {
        auth.validateExpiryStatusOnLocationChange();
    }, [pathname]);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[setActive]", fcLogger);
        const isNavbarBurgerAnchor = (element: HTMLElement | null) => {
            return (element instanceof HTMLAnchorElement && element.classList.contains("navbar-burger"));
        };
        const closeNavbarHandler = (event: MouseEvent) => {
            // event.preventDefault();
            const element = event.target as HTMLAnchorElement;
            if (!isNavbarBurgerAnchor(element) && !isNavbarBurgerAnchor(element.parentElement)) {
                logger.debug("this is not navbar burger element click event. closing navbar");
                sleep("0.5 sec")
                    .then(() => setActive(_prev => false));
            }
        };

        logger.debug("registering click event");
        document.addEventListener("click", closeNavbarHandler);

        return () => {
            logger.debug("un-registering click event");
            document.removeEventListener("click", closeNavbarHandler);
        };
    }, [setActive]);

    const toggleNavbar: React.MouseEventHandler<HTMLAnchorElement> = event => {
        const logger = getLogger("toggleNavbar", fcLogger);
        event.preventDefault();
        logger.debug("open / close navbar");
        setActive(prev => !prev);
    };

    const rootPath = getFullPath("rootPath");
    const logoutPage = getFullPath("logoutPage");
    fcLogger.debug("navbar component updated");

    return (
        <section className="container">
            <nav className="navbar has-shadow is-white">
                <div className="navbar-brand">
                    <NavBarItem
                        icon={ faCalculator }
                        label="Personal Finance"
                        link={ rootPath }
                        id="brandfinance-navlink"
                        key={ "brandfinance" }
                        isProtected={ false }
                        isSelected={ pathname === rootPath }
                    />
                    <a href={ "#" + rootPath } className="navbar-burger" role="button" onClick={ toggleNavbar } aria-label="menu" data-target="navmenu">
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>
                <div className={ `navbar-menu ${isActive ? "is-active" : ""}` } id="navmenu">
                    <div className="navbar-start" >
                        {/* <div className="navbar-start" onClick={ closeNavbarHandler }> */ }
                        {
                            navbarItems.map(itemProp => (
                                (!itemProp.dropdownItems &&
                                    <NavBarItem
                                        icon={ itemProp.icon }
                                        label={ itemProp.label }
                                        link={ itemProp.link }
                                        id={ itemProp.id }
                                        key={ "level1-items-" + itemProp.id }
                                        isProtected={ itemProp.isProtected }
                                        isSelected={ itemProp.isSelected }
                                    />) ||
                                (
                                    !!itemProp.dropdownItems &&
                                    <div className="navbar-item has-dropdown" key={ "dropdown" + itemProp.id }>
                                        <NavBarItem
                                            icon={ itemProp.icon }
                                            label={ itemProp.label }
                                            link={ itemProp.link }
                                            id={ itemProp.id }
                                            key={ "level1-items-" + itemProp.id }
                                            isProtected={ itemProp.isProtected }
                                            isSelected={ itemProp.isSelected }
                                        />
                                        <div className="navbar-dropdown">
                                            {
                                                itemProp.dropdownItems.map(ddItemProp =>
                                                    <NavBarItem
                                                        icon={ ddItemProp.icon }
                                                        label={ ddItemProp.label }
                                                        link={ ddItemProp.link }
                                                        id={ ddItemProp.id }
                                                        key={ "level2-items-" + ddItemProp.id }
                                                        isProtected={ ddItemProp.isProtected }
                                                        isSelected={ ddItemProp.isSelected && itemProp.isSelected }
                                                    />
                                                )
                                            }
                                        </div>
                                    </div>
                                )
                            ))
                        }
                    </div>
                    {
                        auth.userDetails.isAuthenticated &&
                        <div className="navbar-end" >
                            {/* <div className="navbar-end" onClick={ closeNavbarHandler }> */ }
                            {
                                <NavBarItem
                                    icon={ faSignOut }
                                    label="Logout"
                                    link={ logoutPage }
                                    id={ NavLinkId.Logout }
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
