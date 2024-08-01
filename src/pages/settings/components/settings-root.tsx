import { FunctionComponent, useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faGear, faMoneyBills, faUserAlt, faUserSecret } from "@fortawesome/free-solid-svg-icons";
// importing from file to prevent circular dependency error.
import { getFullPath, pathBaseName } from "../../root/components/navigation";
import { HeroTabs } from "../../../components";
import { getLogger } from "../../../services";

const fcLogger = getLogger("FC.SettingsRootPage", null, null, "INFO");

const TAB_HEADS = [
    { id: "root-stngs", title: "General Settings", url: getFullPath("settingsRoot"), icon: faGear },
    { id: "xpns-ctgry-stngs", title: "Expense Category", url: getFullPath("expenseCategorySettings"), icon: faCoins },
    { id: "pymt-acc-typ-stngs", title: "Payment Account Type", url: getFullPath("pymtAccountTypeSettings"), icon: faMoneyBills },
    // { id: "tags-stngs", title: "Tags", url: PAGE_URL.tagsSettings.fullUrl, icon: faTags },
    { id: "profile-stngs", title: "Profile", url: getFullPath("profileSettings"), icon: faUserAlt },
    { id: "scrty-stngs", title: "Security", url: getFullPath("securitySettings"), icon: faUserSecret },
];

const SettingsRootPage: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTabId, setActiveTabId] = useState("");

    useEffect(() => {
        const logger = getLogger("useEffect.dep[location.pathname]", fcLogger);

        logger.debug("pathBaseName", pathBaseName,
            "location.pathname", location.pathname,
            "location.hash", location.hash,
            "location.state", JSON.stringify(location.state),
            "window.location.pathname", window.location.pathname);
        const tabhead = TAB_HEADS.find(tbhd => location.pathname === tbhd.url);
        const activeTabId = (tabhead && tabhead.id) || TAB_HEADS[0].id;
        setActiveTabId(activeTabId);
        logger.debug("tabhead =", tabhead, ", activeTabId =", activeTabId);
    }, [location.pathname]);

    const onTabSelectHandler = (tabId: string) => {
        const logger = getLogger("onTabSelectHandler", fcLogger);
        const tabHeadSelected = TAB_HEADS.find(thd => thd.id === tabId);
        if (tabHeadSelected) {
            logger.debug("tabHeadSelected", { ...tabHeadSelected }, "tabId", tabId);
            navigate(tabHeadSelected.url);
        } else {
            logger.error("tab head not found, tabId", tabId);
        }
    };

    const tabChildren = TAB_HEADS.map(tbhd =>
        <HeroTabs.TabHead id={ tbhd.id } isActive={ tbhd.id === activeTabId } key={ tbhd.id } propType="heroTabHead">
            <span className="icon-text">
                <span className="icon">
                    <FontAwesomeIcon icon={ tbhd.icon } />
                </span>
                <span>{ tbhd.title }</span>
            </span>
        </HeroTabs.TabHead>
    );

    tabChildren.push(
        <HeroTabs.TabContent key={ "tabcontentstngs" } propType="heroTabContent">
            <Outlet />
        </HeroTabs.TabContent>
    );

    fcLogger.log(new Date(), "activeTabId", activeTabId, "tabChildren.length", tabChildren.length);
    return (
        <HeroTabs.Wrapper>
            <HeroTabs.Tab onTabSelect={ onTabSelectHandler } propType="heroTab">
                { tabChildren }
            </HeroTabs.Tab>
        </HeroTabs.Wrapper>
    );
};

export default SettingsRootPage;