import "bulma-list/css/bulma-list.css";
import "./list.css";
import { FunctionComponent, useState } from "react";
import { IconDefinition, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionId } from "../pages/settings/services";


export type ListItem = {
    id: string;
    title: string;
    description: string;
    [key: string]: any;
};

export type Control = {
    content: string;
    id: ActionId;
    icon?: IconDefinition;
    isActive?(item: ListItem): boolean;
};

interface ListProps {
    onControlRequest?(item: ListItem, control: Control): void;
    items: ListItem[];
    controlsInEllipsis: Control[];
    controlsBeforeEllipsis: Control[];
}

/**
 * doc link:   https://bluefantail.github.io/bulma-list/
 */
const List: FunctionComponent<ListProps> = (props) => {

    const [ellipsisOpenId, setEllipsisOpenId] = useState("");

    const onClickControlHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: ListItem, control: Control) => {
        event.preventDefault();
        if (props.onControlRequest) props.onControlRequest(item, control);
    };

    const onClickEllipsisHandler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: ListItem, control: Control) => {
        event.preventDefault();
        if (props.onControlRequest) props.onControlRequest(item, control);
    };


    return (
        <div className="list has-visible-pointer-controls has-hoverable-list-items has-overflow-ellipsis">
            {
                props.items.map(item =>
                    <div className="list-item" key={ item.id + "listitem" } id={ item.id + "listitem" } >
                        <div className="list-item-content">
                            <div className="list-item-title">{ item.title }</div>
                            <div className="list-item-description">{ item.description }</div>
                        </div>

                        <div className="list-item-controls">
                            <div className="buttons is-right">
                                {
                                    props.controlsBeforeEllipsis.map(control =>
                                        <button className="button" onClick={ e => onClickControlHandler(e, item, control) } key={ control.id + item.id } >
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
                                            <button className="button" aria-haspopup="true" aria-controls={ item.id + "dropdown-menu" }>
                                                <span className="icon">
                                                    <FontAwesomeIcon icon={ faEllipsisH } size="sm" />
                                                </span>
                                            </button>
                                        </div>
                                        <div className="dropdown-menu" id={ item.id + "dropdown-menu" } role="menu">
                                            <div className="dropdown-content">
                                                {
                                                    props.controlsInEllipsis
                                                        .filter(control => (!control.isActive || control.isActive(item)))
                                                        .map(control =>
                                                            <div className="dropdown-item" key={ control.id + item.id } onClick={ e => onClickEllipsisHandler(e, item, control) } >
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
        </div>
    );

};

export default List;