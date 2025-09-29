import { FunctionComponent, useEffect, useState, useCallback } from "react";
import "./dropdown.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import DropDownItem from "./dropdown-item";
import { getLogger, testAttributes } from "../../shared";
import { Input } from "../input";


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
    onSelect (item: string | DropDownItemType | undefined): void;
    direction?: "up" | "down";
    size?: "normal" | "small" | "medium" | "large";
    required?: boolean;
    allowSearch?: boolean;
    loadMore?: () => Promise<void>;
}

const findUniqueElementId = (prefix: string) => {
    let id;
    let isUnique = false;
    do {
        id = prefix + Math.floor(Math.random() * 1000);
        if (!document.querySelector(`#${id}`)) {
            isUnique = true;
            break;
        }
    }
    while (!isUnique);
    return id;
};

const fcLogger = getLogger("FC.DropDown", null, null, "DISABLED");

const DropDown: FunctionComponent<DropDownProps> = (props) => {
    const [isOpen, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DropDownItemType>();
    const [dropdownMenuId, setDropdownMenuId] = useState('');
    const [items, setItems] = useState<DropDownItemType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingDropdownItems, setLoadingDropdownItems] = useState(true);

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
        if (props.items) {
            if (typeof props.items[0] === "string") {
                ddItems = props.items.map(item => ({
                    id: item,
                    content: item
                })) as DropDownItemType[];
            } else {
                ddItems = [...props.items] as DropDownItemType[];
            }
            setItems(ddItems);
            setLoadingDropdownItems(false);
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

    const loadMoreItemsHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        if (props.loadMore) {
            setLoadingDropdownItems(true);
            props.loadMore();
        }
    };

    const onSelectHandler = (selectedId?: string) => {
        setOpen(false);
        const matched = selectedId ? filteredItems.find(dditm => (dditm.id === selectedId.replace("drpdwnitm", ""))) : undefined;
        setSelectedItem(matched);
        if (typeof props.items[0] === "string") {
            props.onSelect(matched?.id);
        } else {
            props.onSelect(matched);
        }
    };

    const filteredItems = items.filter(it => !searchTerm || it.content.includes(searchTerm) || !!it.tooltip?.includes(searchTerm));
    const contentsLength = filteredItems.map(it => it.content.length);
    const selectedTriggerContent = selectedItem?.content || "Select";
    fcLogger.debug("selectedTriggerContent =", selectedTriggerContent, ", selectedItem =", selectedItem, ", filteredItems.content =", filteredItems.map(itm => itm.content));

    const paddingLength = (Math.max(...contentsLength, 20) / 2) + 2 - selectedTriggerContent.length;
    const triggerItemPaddingBefore = [];
    const triggerItemPaddingAfter = [];
    for (let i = 0; i < paddingLength; i++) {
        triggerItemPaddingBefore.push(<span key={ "drpdwn-itm-pad-bfr" + i + props.id }>&nbsp;</span>);
        triggerItemPaddingAfter.push(<span key={ "drpdwn-itm-pad-aftr" + i + props.id }>&nbsp;</span>);
    }


    return (
        <div className="field" { ...testAttributes("dropdown-field", "dropdown-id", props.id) }>
            <label htmlFor={ props.id } className="label">{ props.label }</label>
            <div className="control">
                <div className={ `dropdown is-${props.direction === "down" ? "down" : "up"} ${isOpen ? "is-active" : ""}` } id={ props.id }>
                    <div className="dropdown-trigger">
                        <button type="button" className={ `button ${props.size ? "is-" + props.size : ""}` }
                            onClick={ toggleDropdownHandler }
                            { ...testAttributes("toggle-dropdown-action") }>
                            <span> { triggerItemPaddingBefore.map(pad => pad) }{ selectedTriggerContent }{ triggerItemPaddingAfter.map(pad => pad) } </span>
                            <span className="icon is-small">
                                <FontAwesomeIcon icon={ props.direction !== "down" && isOpen ? faAngleUp : faAngleDown } size={ "sm" } />
                            </span>
                        </button>
                    </div>

                    <div className="dropdown-menu" id={ dropdownMenuId }>
                        <div className="dropdown-content">
                            {
                                props.allowSearch &&
                                <Input
                                    id={ props.id + "search-items" }
                                    className="search-items is-small"
                                    type="text"
                                    initialValue={ searchTerm }
                                    maxlength={ 15 }
                                    minlength={ 2 }
                                    onChange={ val => setSearchTerm(val) }
                                    disabled={ isLoadingDropdownItems }
                                />
                            }
                            {
                                filteredItems.map((itm) =>
                                    <DropDownItem
                                        key={ itm.id + "drpdwnitm" }
                                        id={ itm.id + "drpdwnitm" }
                                        content={ itm.content }
                                        tooltip={ itm.tooltip }
                                        onSelect={ onSelectHandler }
                                        type="text"
                                        selectedId={ selectedItem?.id + "drpdwnitm" } />
                                )
                            }
                            {
                                isLoadingDropdownItems &&
                                <DropDownItem
                                    id="drpdwnitm-wait"
                                    type="wait"
                                />
                            }
                            {
                                (filteredItems.length === 0 || !isLoadingDropdownItems) && props.loadMore &&
                                <button className="button" onClick={ loadMoreItemsHandler }
                                    { ...testAttributes("load-more-action") }>Load More</button>
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
                        value={ selectedItem?.id || "" }
                        required={ props.required }
                        className="dropdown-input-required"
                        onChange={ () => { } }
                    />
                }
            </div>
            {
                props.required && !selectedItem?.id &&
                <p className="help is-danger" { ...testAttributes("dropdown-error") }> Please select an item from dropdown. </p>
            }
        </div>
    );
};

export default DropDown;