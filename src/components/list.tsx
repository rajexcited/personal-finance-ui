import "bulma-list/css/bulma-list.css";
import "./list.css";
import { FunctionComponent, useEffect, useState } from "react";
import { IconDefinition, faAngleDown, faAngleUp, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionId } from "../pages/settings/services";
import { DeviceMode, useOrientation } from "../hooks";
import Animated from "./animated";
import { getShortForm, testAttributes } from "../shared";


export type ListItem = {
    id: string;
    title: string;
    description: string;
};

export type Control = {
    content: string;
    id: ActionId;
    icon?: IconDefinition;
    isActive (item: ListItem): boolean;
};

interface ListProps {
    onControlRequest (item: ListItem, control: Control): void;
    items: ListItem[];
    controlsInEllipsis: Control[];
    controlsBeforeEllipsis: Control[];
    viewActionContentInMobile: React.JSX.Element | React.JSX.Element[] | React.ReactNode;
}

/**
 * doc link:   https://bluefantail.github.io/bulma-list/
 */
const List: FunctionComponent<ListProps> = (props) => {
    const { resultedDevice: deviceMode } = useOrientation(DeviceMode.Mobile);
    const [itemCardBodyOpen, setItemCardBodyOpen] = useState("");
    const [nonViewControls, setNonViewControls] = useState<Control[]>([]);

    useEffect(() => {
        const myListControls = [...props.controlsBeforeEllipsis, ...props.controlsInEllipsis];

        setNonViewControls(myListControls.filter(mlc => mlc.id !== ActionId.View));
    }, [props.controlsBeforeEllipsis, props.controlsInEllipsis]);

    const onClickControlHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: ListItem, control: Control) => {
        event.preventDefault();
        props.onControlRequest(item, control);
    };

    const onClickEllipsisHandler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: ListItem, control: Control) => {
        event.preventDefault();
        props.onControlRequest(item, control);
    };

    const onClickCardBodyToggleHandler = (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>, item: ListItem) => {
        event.preventDefault();
        const viewControl = [...props.controlsBeforeEllipsis, ...props.controlsInEllipsis].find(c => c.id === ActionId.View);
        setItemCardBodyOpen(prev => {
            if (prev === item.id) {
                return "";
            } else {
                if (viewControl) {
                    props.onControlRequest(item, viewControl);
                }
                return item.id;
            }
        });
    };


    if (deviceMode === DeviceMode.Mobile) {
        return (
            <section className="mb-3 list-cards is-mobile"
                { ...testAttributes("list-section", "size", props.items.length.toString()) }>
                {
                    props.items.map(item =>
                        <section className="container mb-4 list-item-card" key={ "list-item-card-" + item.id } { ...testAttributes("listitem", "title", item.title) }>
                            <div className="card">
                                <header className="card-header">
                                    <div className="card-header-title">
                                        <div className="card-header-icon">
                                            <div className="columns">
                                                <div className="column">
                                                    <div className="list-item-title">{ getShortForm(item.title, 25, "-") }</div>
                                                    <div className="list-item-description">{ getShortForm(item.description, 40, "-") }</div>
                                                </div>
                                                <div className="column">
                                                    <div className="buttons">
                                                        {
                                                            nonViewControls
                                                                .filter(nvc => nvc.isActive(item))
                                                                .map(nvc =>
                                                                    <button className="list-item-control button is-text is-active"
                                                                        onClick={ e => onClickControlHandler(e, item, nvc) }
                                                                        key={ "listcontrol" + nvc.id }
                                                                        { ...testAttributes("card-header-actions", "action-id", nvc.id) }>
                                                                        {
                                                                            nvc.icon &&
                                                                            <span className="icon has tooltip" data-tooltip={ nvc.content }>
                                                                                <FontAwesomeIcon icon={ nvc.icon } />
                                                                            </span>
                                                                        }
                                                                        <span>{ nvc.content }</span>
                                                                    </button>
                                                                )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="card-header-icon" aria-label="expand breakdown"
                                        onClick={ e => onClickCardBodyToggleHandler(e, item) }
                                        { ...testAttributes("card-header-actions", "action-id", ActionId.View) }>
                                        <span className="icon is-large">
                                            <FontAwesomeIcon icon={ itemCardBodyOpen === item.id ? faAngleUp : faAngleDown } />
                                        </span>
                                    </button>
                                </header>
                                <Animated animateOnMount={ false } isPlayIn={ itemCardBodyOpen === item.id } animatedIn="fadeIn" animatedOut="fadeOut" isVisibleAfterAnimateOut={ false } >
                                    <div className="card-content is-active">
                                        <div className="content">
                                            { props.viewActionContentInMobile }
                                        </div>
                                    </div>
                                    <footer className="card-footer is-active"> </footer>
                                </Animated>
                            </div>
                        </section>
                    )
                }
            </section>
        );
    }
    // large screen size
    return (
        <section className="list has-visible-pointer-controls has-hoverable-list-items has-overflow-ellipsis"
            { ...testAttributes("list-section") }>
            {
                props.items.map(item =>
                    <div className="list-item" key={ item.id + "listitem" } id={ item.id + "listitem" } { ...testAttributes("listitem", "title", item.title) }>
                        <div className="list-item-content">
                            <div className="list-item-title">{ item.title }</div>
                            <div className="list-item-description">{ item.description || "-" }</div>
                        </div>

                        <div className="list-item-controls">
                            <div className="buttons is-right">
                                {
                                    props.controlsBeforeEllipsis
                                        .filter(control => control.isActive(item))
                                        .map(control =>
                                            <button className="button" onClick={ e => onClickControlHandler(e, item, control) }
                                                key={ control.id + item.id }
                                                { ...testAttributes("actions-before-ellipsis", "action-id", control.id) }
                                            >
                                                {
                                                    control.icon &&
                                                    <span className="icon">
                                                        <FontAwesomeIcon icon={ control.icon } size="sm" />
                                                    </span>
                                                }
                                                <span>{ control.content }</span>
                                            </button>
                                        )
                                }
                                {
                                    !!props.controlsInEllipsis.length &&
                                    <div className="dropdown is-hoverable">
                                        <div className="dropdown-trigger">
                                            <button className="button" aria-haspopup="true" aria-controls={ item.id + "dropdown-menu" }
                                                { ...testAttributes("action-ellipsis") }>
                                                <span className="icon">
                                                    <FontAwesomeIcon icon={ faEllipsisH } size="sm" />
                                                </span>
                                            </button>
                                        </div>
                                        <div className="dropdown-menu" id={ item.id + "dropdown-menu" } role="menu"
                                            { ...testAttributes("ellipsis-dropdown-menu") }>
                                            <div className="dropdown-content">
                                                {
                                                    props.controlsInEllipsis
                                                        .filter(control => control.isActive(item))
                                                        .map(control =>
                                                            <div className="dropdown-item" key={ control.id + item.id }
                                                                onClick={ e => onClickEllipsisHandler(e, item, control) }
                                                                { ...testAttributes("actions-in-ellipsis", "action-id", control.id) }>
                                                                {
                                                                    control.icon &&
                                                                    <span className="icon">
                                                                        <FontAwesomeIcon icon={ control.icon } size="sm" />
                                                                    </span>
                                                                }
                                                                <span>{ control.content }</span>
                                                            </div>
                                                        )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                )
            }
        </section>
    );

};

export default List;