import { FunctionComponent, useState } from "react";
import { Input } from "../input";
import './dropdown-item.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";


interface WaitDropDownItemPropBase {
    id: string;
    type: "wait";
}

interface NonwaitDropDownItemPropBase {
    id: string;
    selectedId?: string;
    onSelect (id: string | undefined): void;
}

interface TextDropDownItemProps extends NonwaitDropDownItemPropBase {
    type: "text";
    content: string;
    tooltip?: string;
}

interface InputDropDownItemProps extends NonwaitDropDownItemPropBase {
    type: "input";
    placeholder?: string;
    size?: number;
    onChange?(value: string): void;
    onSubmit?(value: string): void;
}

export type DropDownItemProps =
    | WaitDropDownItemPropBase
    | TextDropDownItemProps
    | InputDropDownItemProps;

const DropDownItem: FunctionComponent<DropDownItemProps> = (props) => {
    const [newInputValue, setNewInputValue] = useState('');

    const selectItemHandler = (event: React.MouseEvent<HTMLDivElement>, id: string) => {
        event.preventDefault();
        event.stopPropagation();
        if ("onSelect" in props) {
            if (props.selectedId !== id) {
                props.onSelect(id);
            } else {
                props.onSelect(undefined);
            }
        }
    };

    const onInputChangeHandler = (value: string) => {
        setNewInputValue(value);
        if (props.type === "input" && props.onChange) {
            props.onChange(value);
        }
    };

    const isActive = "selectedId" in props && props.selectedId === props.id;

    return (
        <>
            <div
                className={ `dropdown-item ${isActive ? "is-active" : ""}` }
                onClick={ (e) => selectItemHandler(e, props.id) }
            >

                { props.type === "text" &&
                    <div className="unselectable">
                        <span>                        { props.content }                        </span>
                        {
                            props.tooltip &&
                            <span className={ `icon has-text-info${isActive ? "-light" : ""} tooltip is-tooltip-multiline is-tooltip-right` } data-tooltip={ props.tooltip.split(";").join("    ") }> <FontAwesomeIcon icon={ faInfoCircle } /> </span>
                        }
                        <span className="icon unselect has-text-info-light">
                            <FontAwesomeIcon icon={ faXmark } />
                        </span>
                    </div>
                }
                { props.type === "input" &&
                    <Input className="is-small"
                        type="text"
                        id={ props.id }
                        placeholder={ props.placeholder ? props.placeholder : "Enter" }
                        size={ props.size }
                        initialValue={ newInputValue }
                        onChange={ onInputChangeHandler }
                        onSubmit={ props.onSubmit }
                    />
                }
                {
                    props.type === "wait" &&
                    <div className="has-text-centered">
                        <span className="icon">
                            <FontAwesomeIcon icon={ faSpinner } className="fa-pulse" />
                        </span>
                    </div>
                }
            </div>
            <hr className="dropdown-divider" />
        </>
    );
};

export default DropDownItem;