import { FunctionComponent, Children, isValidElement } from "react";
import "./hero-tabs.css";
import { getLogger } from "../shared";

interface HeroType {
    propType: string;
}

interface HeroTabHeadProps extends HeroType {
    children: JSX.Element;
    isActive?: boolean;
    id: string;
    propType: "heroTabHead";
}
const HeroTabHead: FunctionComponent<HeroTabHeadProps> = (props) => {
    return (<>{ props.children }</>);
};

interface HeroTabContentProps {
    children: JSX.Element;
    propType: "heroTabContent";
}
const HeroTabContent: FunctionComponent<HeroTabContentProps> = (props) => {
    return (<>{ props.children }</>);
};

interface HeroTabProps {
    children: JSX.Element | JSX.Element[];
    onTabSelect (tabId: string): void;
    propType: "heroTab";
}
const HeroTab: FunctionComponent<HeroTabProps> = (props) => {
    return (<span>{ props.children }</span>);
};

const fcHeroTabsLogger = getLogger("FC.HeroTabs", null, null, "INFO");
interface HeroTabsProps {
    children: JSX.Element;
}
interface TabHeadType {
    id: string;
    element: JSX.Element;
    isActive?: boolean;
}
const HeroTabs: FunctionComponent<HeroTabsProps> = (props) => {
    let tabHeads: TabHeadType[] = [];
    let tabContentElement: JSX.Element | null = null;
    let onTabSelect: (tabId: string) => void;
    let activeTabHeadId: string = "";

    const baseProps = props.children.props as HeroType;
    fcHeroTabsLogger.debug("props.children.type.name", props.children.type.name, ", baseProps =", baseProps);
    if (baseProps.propType === "heroTab") {
        const logger = getLogger(baseProps.propType, fcHeroTabsLogger);
        const heroTabProps = props.children.props as HeroTabProps;
        onTabSelect = heroTabProps.onTabSelect;
        const tabHeadElememts = Children.toArray(heroTabProps.children).filter(ch => {
            logger.debug("tabHeadElememts, isValidElement =", isValidElement(ch));
            if (isValidElement(ch)) {
                const elm = ch as JSX.Element;
                const baseProps = ch.props as HeroType;
                logger.debug("tabHeadElememts, elm.type.name =", elm.type.name, ", baseProps =", baseProps);
                return baseProps.propType === "heroTabHead";
            }
            return false;
        }) as JSX.Element[];
        tabHeads = tabHeadElememts.map(tbhd => {
            const props = tbhd.props as HeroTabHeadProps;
            logger.debug("tabHeadElememts, props =", props, ", activeTabHeadId =", activeTabHeadId);
            if (!activeTabHeadId && props.isActive) {
                activeTabHeadId = props.id;
                return { id: props.id, element: tbhd, isActive: true };
            }
            return { id: props.id, element: tbhd };
        });
        tabContentElement = Children.toArray(heroTabProps.children).find(ch => {
            logger.debug("tabContentElement, isValidElement =", isValidElement(ch));
            if (isValidElement(ch)) {
                const elm = ch as JSX.Element;
                const baseProps = ch.props as HeroType;
                logger.debug("tabContentElement, elm.type.name =", elm.type.name, ", baseProps =", baseProps);
                return baseProps.propType === "heroTabContent";
            }
            return false;
        }) as JSX.Element;
        logger.debug("tabHeadElememts", tabHeadElememts, "tabHeads", tabHeads, "tabContentElement", tabContentElement, "onTabSelect", onTabSelect);
    }

    const onClickTabHeadHandler = (tabId: string, event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        event.preventDefault();
        if (onTabSelect) {
            onTabSelect(tabId);
        }
    };

    return (
        <section className="hero-tabs">
            <div className="hero is-light is-small">
                <div className="hero-head">
                    <div className="tabs is-boxed">
                        <ul>
                            {
                                tabHeads.map(tbhd =>
                                    <li className={ tbhd.isActive ? "is-active" : "" }
                                        onClick={ onClickTabHeadHandler.bind(null, tbhd.id) }
                                        id={ tbhd.id + "-tabhead-li" }
                                        key={ tbhd.id + "-tabhead-key" }>
                                        <a> { tbhd.element } </a>
                                    </li>
                                )
                            }
                        </ul>
                    </div>
                </div>
                <div className="hero-body">
                    <div className="tabs-content-wrap">
                        <div id={ activeTabHeadId + "-tabcontent" } className="tab-content is-active">
                            { tabContentElement }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HeroTabsComponent = {
    Wrapper: HeroTabs,
    Tab: HeroTab,
    TabHead: HeroTabHead,
    TabContent: HeroTabContent,
};

export default HeroTabsComponent;
