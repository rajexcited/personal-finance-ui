import { FunctionComponent, useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// importing from file to prevent circular dependency error.
import { pathBaseName } from "../../root/components/navigation/page-url";
import { HeroTabs } from "../../../components";
import { getLogger } from "../services";
import { TAB_HEADS } from "./settings-root";

const fcLogger = getLogger("FC.SettingsRootHeroTabs", null, null, "DISABLED");

export const SettingsRootHeroTabs: FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTabId, setActiveTabId] = useState("");

  useEffect(() => {
    const logger = getLogger("useEffect.dep[location.pathname]", fcLogger);

    logger.debug(
      "pathBaseName",
      pathBaseName,
      "location.pathname",
      location.pathname,
      "location.hash",
      location.hash,
      "location.state",
      JSON.stringify(location.state),
      "window.location.pathname",
      window.location.pathname
    );
    const tabhead = TAB_HEADS.find((tbhd) => location.pathname === tbhd.url);
    const activeTabId = (tabhead && tabhead.id) || TAB_HEADS[0].id;
    setActiveTabId(activeTabId);
    logger.debug("tabhead =", tabhead, ", activeTabId =", activeTabId);
  }, [location.pathname]);

  const onTabSelectHandler = (tabId: string) => {
    const logger = getLogger("onTabSelectHandler", fcLogger);
    const tabHeadSelected = TAB_HEADS.find((thd) => thd.id === tabId);
    if (tabHeadSelected) {
      logger.debug("tabHeadSelected", { ...tabHeadSelected }, "tabId", tabId);
      navigate(tabHeadSelected.url);
    } else {
      logger.error("tab head not found, tabId", tabId);
    }
  };

  const tabChildren = TAB_HEADS.map((tbhd) => (
    <HeroTabs.TabHead id={tbhd.id} isActive={tbhd.id === activeTabId} key={tbhd.id} propType="heroTabHead">
      <span className="icon-text">
        {tbhd.icon && (
          <span className="icon">
            <FontAwesomeIcon icon={tbhd.icon} />
          </span>
        )}
        <span>{tbhd.title}</span>
      </span>
    </HeroTabs.TabHead>
  ));

  tabChildren.push(
    <HeroTabs.TabContent key={"tabcontentstngs"} propType="heroTabContent">
      <Outlet />
    </HeroTabs.TabContent>
  );

  fcLogger.log(new Date(), "activeTabId", activeTabId, "tabChildren.length", tabChildren.length);
  return (
    <HeroTabs.Wrapper>
      <HeroTabs.Tab onTabSelect={onTabSelectHandler} propType="heroTab">
        {tabChildren}
      </HeroTabs.Tab>
    </HeroTabs.Wrapper>
  );
};
