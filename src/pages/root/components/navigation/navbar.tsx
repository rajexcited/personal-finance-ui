import "./navbar.css";
import React, { useState, FunctionComponent, useEffect } from "react";
import {
  faCalculator,
  faMoneyBill,
  faBank,
  faGears,
  faUserPlus,
  faSignInAlt,
  faSignOut,
  faShoppingCart,
  faDollarSign,
  faUndo
} from "@fortawesome/free-solid-svg-icons";
import NavBarItem, { NavbarItemProp } from "./navbar-item";
import { getFullPath } from "./page-url";
import { useAuth } from "../../../auth";
import { useLocation } from "react-router";
import { TAB_HEADS as SettingsTabs } from "../../../settings/components/settings-root";
import { getLogger } from "../../services";
import { ObjectDeepDifference, sleep } from "../../../../shared";
import { SubNavItem } from "./field-types";
import { JSONArray } from "../../../../shared/utils/deep-obj-difference";
import { DeviceMode, useOrientation } from "../../../../hooks";

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
  { link: getFullPath("pymtAccountsRoot"), label: "Payment Accounts", icon: faBank, id: NavLinkId.PaymentAccounts, isProtected: true, isSelected: false },
  { link: getFullPath("settingsRoot"), label: "Settings", icon: faGears, id: NavLinkId.Settings, isProtected: true, isSelected: false },
  { link: getFullPath("signupPage"), label: "Signup", icon: faUserPlus, id: NavLinkId.Signup, isProtected: false, isSelected: false },
  { link: getFullPath("loginPage"), label: "Login", icon: faSignInAlt, id: NavLinkId.Login, isProtected: false, isSelected: false }
];

const subNavItemsMap: { [key: string]: SubNavItem[] } = {
  [NavLinkId.Settings]: SettingsTabs,
  [NavLinkId.Expenses]: [
    { id: "view-expenses", title: "View Expenses", url: getFullPath("expenseJournalRoot"), icon: faMoneyBill },
    { id: "add-purchase", title: "Add Purchase", url: getFullPath("addPurchase"), icon: faShoppingCart },
    { id: "add-income", title: "Add Income", url: getFullPath("addIncome"), icon: faDollarSign },
    { id: "add-refund", title: "Add Refund", url: getFullPath("addPurchaseRefund", "unknown"), icon: faUndo }
  ],
  [NavLinkId.PaymentAccounts]: [
    { id: "view-payment-accounts", title: "View Payment Accounts", url: getFullPath("pymtAccountsRoot") },
    { id: "add-payment-account", title: "Add Account", url: getFullPath("addPymAccount") }
  ]
};

type NavbarItemDropDownProp = NavbarItemProp & { isHovered?: boolean; dropdownItems?: NavbarItemProp[] };

const fcLogger = getLogger("FC.NavBar", null, null, "DISABLED");

const NavBar: FunctionComponent = () => {
  const [isActive, setActive] = useState(false);
  const [navbarItems, setNavbarItems] = useState<NavbarItemDropDownProp[]>([]);
  const auth = useAuth();
  const { pathname } = useLocation();
  const { resultedDevice: deviceMode } = useOrientation(DeviceMode.Desktop);

  useEffect(() => {
    const logger = getLogger("useEffect.dep[pathname, navbarItems, auth.userDetails.isAuthenticated]", fcLogger);
    logger.debug("in useEffect, updating navbar");
    let navbarItemlist = navbarItems;
    if (!navbarItems.length || navbarItems[0].isProtected !== auth.userDetails.isAuthenticated) {
      navbarItemlist = items.filter((item) => auth.userDetails.isAuthenticated === item.isProtected).map((item) => ({ ...item, isHovered: false }));
      logger.debug("updated navbar item list because of auth mismatched");
    }
    if (auth.userDetails.isAuthenticated) {
      navbarItemlist.forEach((ni) => {
        if (!ni.dropdownItems && subNavItemsMap[ni.id]) {
          ni.dropdownItems = subNavItemsMap[ni.id]?.map((subItem) => ({
            id: subItem.id + "-navlink",
            icon: subItem.icon,
            isProtected: true,
            isSelected: false,
            label: subItem.title,
            link: subItem.url
          }));
        }
      });
    }
    let selectedNavbarItem = navbarItemlist.find((item) => pathname === item.link);
    if (pathname === getFullPath("rootPath")) {
      selectedNavbarItem = undefined;
      const list: NavbarItemProp[] = [];
      let isPreviouslySelected = false;
      navbarItemlist.forEach((item) => {
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
      selectedNavbarItem = navbarItemlist.find((item) => pathname.startsWith(item.link));
    }

    if (selectedNavbarItem) {
      if (!selectedNavbarItem.isSelected) {
        logger.debug("matching navbar item is not selected, so updating list with selection");
        const list: NavbarItemProp[] = [];
        navbarItemlist.forEach((item) => {
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
      const selectedItem = navbarItemlist.find((ni) => ni.isSelected);
      if (selectedItem?.dropdownItems) {
        logger.debug("found dropdown items for selected navbar item, so updating dropdown item selection");
        const selectedDdItemmatched = selectedItem.dropdownItems.find((ddItem) => ddItem.isSelected && ddItem.link === pathname);
        if (!selectedDdItemmatched) {
          const newddItems: NavbarItemProp[] = selectedItem.dropdownItems.map((ddItem) => ({
            ...ddItem,
            isSelected: ddItem.link === pathname
          }));
          selectedItem.dropdownItems = newddItems;
          navbarItemlist = [...navbarItemlist];
        }
      }
      let hasDropDownUpdated = false;
      const updatedItems = navbarItemlist.map((ni) => {
        if (ni.dropdownItems && !ni.isSelected) {
          const dropdownItems = ni.dropdownItems.map((niddi) => {
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
      const diff = ObjectDeepDifference(navbarItems as unknown as JSONArray, navbarItemlist as unknown as JSONArray);
      logger.debug("new navbarItemlist=", navbarItemlist, "old navbarItems=", navbarItems, "has navbar diff? ", Object.keys(diff).length > 0, " diff=", diff);
      setNavbarItems(navbarItemlist);
    }
  }, [pathname, navbarItems, auth.userDetails.isAuthenticated]);

  useEffect(() => {
    auth.validateExpiryStatusOnLocationChange();
  }, [pathname]);

  useEffect(() => {
    const logger = getLogger("useEffect.dep[setActive]", fcLogger);
    const isNavbarBurgerAnchor = (element: HTMLElement | null) => {
      return element instanceof HTMLAnchorElement && element.classList.contains("navbar-burger");
    };
    const closeNavbarHandler = (event: MouseEvent) => {
      const element = event.target as HTMLAnchorElement;
      if (!isNavbarBurgerAnchor(element) && !isNavbarBurgerAnchor(element.parentElement)) {
        logger.debug("this is not navbar burger element click event. closing navbar in half sec. current state isActive=", isActive);
        sleep("0.5 sec").then(() =>
          setActive((_prev) => {
            logger.debug("navbar is closed. setting active flag to false, previous isActive=", _prev);
            return false;
          })
        );
      }
    };

    logger.debug("registering click event");
    document.addEventListener("click", closeNavbarHandler);

    return () => {
      logger.debug("un-registering click event");
      document.removeEventListener("click", closeNavbarHandler);
    };
  }, [setActive]);

  const toggleNavbar: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    const logger = getLogger("toggleNavbar", fcLogger);
    event.preventDefault();
    logger.debug("open / close navbar");
    setActive((prev) => !prev);
  };

  const openNavbarItemDropdown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, prop: NavbarItemDropDownProp) => {
    event.preventDefault();
    if (deviceMode === DeviceMode.Desktop) {
      setNavbarItems((prev) =>
        prev.map((item) => {
          if (item.id === prop.id) {
            return { ...item, isHovered: true };
          }
          return item;
        })
      );
    }
  };

  const closeNavbarItemDropdown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, prop: NavbarItemDropDownProp) => {
    event.preventDefault();
    if (deviceMode === DeviceMode.Desktop) {
      setNavbarItems((prev) =>
        prev.map((item) => {
          if (item.id === prop.id) {
            return { ...item, isHovered: false };
          }
          return item;
        })
      );
    }
  };

  const rootPath = getFullPath("rootPath");
  const logoutPage = getFullPath("logoutPage");
  fcLogger.debug("navbar component updated, isActive=", isActive);

  return (
    <section className="container">
      <nav className="navbar has-shadow is-white">
        <div className="navbar-brand">
          <NavBarItem
            icon={faCalculator}
            label="Personal Finance"
            link={rootPath}
            id="brandfinance-navlink"
            key={"brandfinance"}
            isProtected={false}
            isSelected={pathname === rootPath}
          />
          <a href={"#" + rootPath} className="navbar-burger" role="button" onClick={toggleNavbar} aria-label="menu" data-target="navmenu">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div className={`navbar-menu ${isActive ? "is-active" : ""}`} id="navmenu">
          <div className="navbar-start">
            {navbarItems.map(
              (itemProp) =>
                (!itemProp.dropdownItems && (
                  <NavBarItem
                    icon={itemProp.icon}
                    label={itemProp.label}
                    link={itemProp.link}
                    id={itemProp.id}
                    key={"level1-items-" + itemProp.id}
                    isProtected={itemProp.isProtected}
                    isSelected={itemProp.isSelected}
                  />
                )) ||
                (!!itemProp.dropdownItems && (
                  <div
                    className="navbar-item has-dropdown"
                    key={"dropdown" + itemProp.id}
                    onMouseOver={(e) => openNavbarItemDropdown(e, itemProp)}
                    onMouseOut={(e) => closeNavbarItemDropdown(e, itemProp)}
                  >
                    <NavBarItem
                      icon={itemProp.icon}
                      label={itemProp.label}
                      link={itemProp.link}
                      id={itemProp.id}
                      key={"level1-items-" + itemProp.id}
                      isProtected={itemProp.isProtected}
                      isSelected={itemProp.isSelected}
                      class="navbar-link"
                    />
                    <div className={"navbar-dropdown" + (!!itemProp.isHovered ? " is-active" : "")}>
                      {itemProp.dropdownItems.map((ddItemProp) => (
                        <NavBarItem
                          icon={ddItemProp.icon}
                          label={ddItemProp.label}
                          link={ddItemProp.link}
                          id={ddItemProp.id}
                          key={"level2-items-" + ddItemProp.id}
                          isProtected={ddItemProp.isProtected}
                          isSelected={ddItemProp.isSelected && itemProp.isSelected}
                        />
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
          {auth.userDetails.isAuthenticated && (
            <div className="navbar-end">
              {<NavBarItem icon={faSignOut} label="Logout" link={logoutPage} id={NavLinkId.Logout} key="logout" isProtected={true} isSelected={false} />}
            </div>
          )}
        </div>
      </nav>
    </section>
  );
};

export default NavBar;
