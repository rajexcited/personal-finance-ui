import { FunctionComponent, useEffect, useState, useCallback } from "react";
import "./dropdown.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import DropDownItem from "./dropdown-item";
import { getLogger } from "../services";

export type DropDownItemType = {
    id: string;
    content: string;
    tooltip?: string;
};

export interface DropDownProps {
    id: string;
    label: string;
    items: string[] | DropDownItemType[];
    selectedItem?: string | DropDownItemType;
    defaultItem?: string | DropDownItemType;
    onSelect (item: string | DropDownItemType): void;
    direction?: "up" | "down";
    size?: "normal" | "small" | "medium" | "large";
    required?: boolean;
}

const findUniqueElementId = (prefix: string) => {
    let id;
    do {
        id = prefix + Math.floor(Math.random() * 1000);
        if (!document.querySelector(`#${id}`))
            break;
    }
    while (true);
    return id;
};
const fcLogger = getLogger("FC.DropDown", null, null, "DEBUG");

const DropDown: FunctionComponent<DropDownProps> = (props) => {
    const [isOpen, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DropDownItemType>();
    const [dropdownMenuId, setDropdownMenuId] = useState('');
    const [items, setItems] = useState<DropDownItemType[]>([]);

    const closeDropdownHandler = useCallback((event: MouseEvent) => {
        event.preventDefault();
        setOpen(false);
    }, []);

    useEffect(() => {
        setDropdownMenuId(findUniqueElementId("dropdown-menu"));

        return () => {
            document.removeEventListener("click", closeDropdownHandler);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                document.removeEventListener("click", closeDropdownHandler);
            }, 10);
        } else {
            setTimeout(() => {
                document.addEventListener("click", closeDropdownHandler);
            }, 10);
        }
    }, [isOpen, closeDropdownHandler]);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[props.selectedItem]", fcLogger);
        logger.info("props.selectedItem =", props.selectedItem);
        if (props.selectedItem) {
            if (typeof props.selectedItem === "string") {
                if (props.selectedItem !== selectedItem?.content) {
                    const selected = {
                        id: props.selectedItem,
                        content: props.selectedItem
                    };
                    setSelectedItem(selected);
                }
            } else if (props.selectedItem.content !== selectedItem?.content) {
                setSelectedItem(props.selectedItem);
            }
        }
    }, [props.selectedItem]);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[props.selectedItem]", fcLogger);
        logger.info("props.items =", props.items, ", props.defaultItem =", props.defaultItem);
        let ddItems: DropDownItemType[] = [];
        if (props.items && props.items.length > 0) {
            if (typeof props.items[0] === "string") {
                ddItems = props.items.map(item => ({
                    id: item,
                    content: item
                })) as DropDownItemType[];
            } else {
                ddItems = [...props.items] as DropDownItemType[];
            }
            setItems(ddItems);
        }
        if (props.defaultItem) {
            const defaultItem: DropDownItemType = typeof props.defaultItem === "string" ? { id: props.defaultItem, content: props.defaultItem } : props.defaultItem;
            const selectedDefaultItem = ddItems.find(di => di.id === defaultItem.id);
            setSelectedItem(selectedDefaultItem || defaultItem);
        }
    }, [props.items, props.defaultItem]);

    const toggleDropdownHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setOpen(active => !active);
    };

    const onSelectHandler = (item: DropDownItemType, selectedId: string) => {
        setOpen(false);
        setSelectedItem(item);
        if (typeof props.items[0] === "string") {
            props.onSelect(item.id);
        } else {
            props.onSelect(item);
        }
    };

    const contentsLength = items.map(it => it.content.length);
    const selectedTriggerContent = selectedItem?.content || "Select";
    fcLogger.debug("selectedTriggerContent =", selectedTriggerContent, ", selectedItem =", selectedItem, ", items.content =", items.map(itm => itm.content));

    const paddingLength = (Math.max(...contentsLength, 20) / 2) + 2 - selectedTriggerContent.length;
    const triggerItemPaddingBefore = [];
    const triggerItemPaddingAfter = [];
    for (let i = 0; i < paddingLength; i++) {
        triggerItemPaddingBefore.push(<span key={ "drpdwn-itm-pad-bfr" + i + props.id }>&nbsp;</span>);
        triggerItemPaddingAfter.push(<span key={ "drpdwn-itm-pad-aftr" + i + props.id }>&nbsp;</span>);
    }

    return (
        <div className="field">
            <label htmlFor={ props.id } className="label">{ props.label }</label>
            <div className="control">
                <div className={ `dropdown is-${props.direction === "down" ? "down" : "up"} ${isOpen ? "is-active" : ""}` } id={ props.id }>
                    <div className="dropdown-trigger">
                        <button className={ `button ${props.size ? "is-" + props.size : ""}` } aria-haspopup="true" aria-controls={ dropdownMenuId } onClick={ toggleDropdownHandler }>
                            <span>{ triggerItemPaddingBefore.map(pad => pad) }{ selectedTriggerContent }{ triggerItemPaddingAfter.map(pad => pad) }</span>
                            <span className="icon is-small">
                                <FontAwesomeIcon icon={ props.direction !== "down" && isOpen ? faAngleUp : faAngleDown } size={ "sm" } />
                            </span>
                        </button>
                    </div>

                    <div className="dropdown-menu" id={ dropdownMenuId } role="menu">
                        <div className="dropdown-content">
                            {
                                items.map((itm) =>
                                    <DropDownItem
                                        key={ itm.id + "drpdwnitm" }
                                        id={ itm.id + "drpdwnitm" }
                                        content={ itm.content }
                                        onSelect={ onSelectHandler.bind(null, itm) }
                                        type="text"
                                        selectedId={ selectedItem?.id + "drpdwnitm" } />
                                )
                            }
                            {
                                !items.length &&
                                <DropDownItem
                                    id="drpdwnitm-wait"
                                    type="wait"
                                />
                            }
                        </div>
                        <div className={ props.direction === "down" && isOpen ? "my-5 py-5" : "is-hidden" }>&nbsp;</div>
                    </div>
                </div>
                {
                    props.required &&
                    <input
                        type="text"
                        name={ props.id + "dropdown" }
                        id={ props.id + "dropdown" }
                        value={ selectedItem?.id }
                        required={ props.required }
                        className="dropdown-input-required"
                    />
                }
            </div>
            {
                props.required && !selectedItem?.id &&
                <p className="help is-danger"> Please select an item from dropdown. </p>
            }
        </div>
    );
};

export default DropDown;