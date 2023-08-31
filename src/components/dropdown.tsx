import { FunctionComponent, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import DropDownItem from "./dropdown-item";


export interface DropDownProps {
    id: string;
    label: string;
    items: string[];
    selectedItem?: string;
    defaultItem?: string;
    allowInput?: boolean;
    onSelect (item: string): void;
    direction?: "up" | "down";
    size?: "normal" | "small" | "medium" | "large";
}

interface Item {
    id: string;
    content: string;
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

const DropDown: FunctionComponent<DropDownProps> = (props) => {
    const [isOpen, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(props.selectedItem);
    const [newInputValue, setNewInputValue] = useState('');
    const [inputItemId, setInputItemId] = useState('');
    const [dropdownMenuId, setDropdownMenuId] = useState('');

    useEffect(() => {
        // to set only one time while initializing
        setDropdownMenuId(findUniqueElementId("dropdown-menu"));
        if (props.allowInput) {
            setInputItemId(findUniqueElementId("dropdown-input-item"));
        }
    }, [props.allowInput]);

    const items = Object.fromEntries(props.items.map(item => [item, item]));
    items[inputItemId] = newInputValue;

    //todo the click event is getting triggered when hitting enter key on input element. this is causing 
    //dropdown to be toggled. investigate why enter key is propogating to click event.
    // elements are not overlapping. not high priority
    const toggleDropdownHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setOpen((active) => !active);
    };

    const onSelectHandler = (id: string) => {
        setOpen(false);
        setSelectedItem(id);
        const value = props.allowInput && id === inputItemId ? newInputValue : items[id];
        props.onSelect(value);
    };

    const maxLength = Math.max(...props.items.map(it => it.length), 20);
    const triggerItem = selectedItem ? items[selectedItem] : props.defaultItem ? props.defaultItem : "Select";
    const paddingLength = maxLength / 2 + 2 - triggerItem.length;
    const triggerItemPadding = [];
    for (let i = 0; i < paddingLength; i++) {
        triggerItemPadding.push(<>&nbsp;</>);
    }

    return (
        <div className="field">
            <label htmlFor={ props.id } className="label">{ props.label }</label>
            <div className="control">
                <div className={ `dropdown is-${props.direction === "down" ? "down" : "up"} ${isOpen ? "is-active" : ""}` } id={ props.id }>
                    <div className="dropdown-trigger">
                        <button className={ `button ${props.size ? "is-" + props.size : ""}` } aria-haspopup="true" aria-controls={ dropdownMenuId } onClick={ toggleDropdownHandler }>
                            <span>{ triggerItemPadding.map(pad => pad) }{ triggerItem }{ triggerItemPadding.map(pad => pad) }</span>
                            <span className="icon is-small">
                                <FontAwesomeIcon icon={ props.direction !== "down" && isOpen ? faAngleUp : faAngleDown } size={ "sm" } />
                            </span>
                        </button>
                    </div>

                    <div className="dropdown-menu" id={ dropdownMenuId } role="menu">
                        <div className="dropdown-content">
                            {
                                Object.entries(items).slice(0, -1).map(([id, content]) =>
                                    <DropDownItem
                                        key={ id }
                                        id={ id }
                                        content={ content }
                                        onSelect={ onSelectHandler }
                                        type="text"
                                        selectedId={ selectedItem }
                                    />
                                )
                            }
                            {
                                props.allowInput && <DropDownItem
                                    key={ inputItemId }
                                    id={ inputItemId }
                                    type="input"
                                    onSubmit={ setNewInputValue }
                                    onSelect={ onSelectHandler }
                                    selectedId={ selectedItem }
                                    size={ 20 }
                                />
                            }
                        </div>
                        <div className={ props.direction === "down" && isOpen ? "my-5 py-5" : "is-hidden" }>&nbsp;</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DropDown;