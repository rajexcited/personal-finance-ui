import { FunctionComponent, useState } from "react";
import Input from "./input";
import './dropdown-item.css'


interface DropDownItemPropBase {
    id: string;
    selectedId?: string;
    onSelect(id: string): void;
}

interface TextDropDownItemProps extends DropDownItemPropBase {
    type: "text";
    content: string;
}
interface InputDropDownItemProps extends DropDownItemPropBase {
    type: "input";
    placeholder?: string;
    size?: number;
    onChange?(value: string): void;
    onSubmit?(value: string): void;
}

export type DropDownItemProps =
    | TextDropDownItemProps
    | InputDropDownItemProps

const DropDownItem: FunctionComponent<DropDownItemProps> = (props) => {
    // const [selectedItem, setSelectedItem] = useState(props.selectedId);
    const [newInputValue, setNewInputValue] = useState('');

    const selectItemHandler = (event: React.MouseEvent<HTMLDivElement>, id: string) => {
        event.preventDefault();
        event.stopPropagation();
        // setSelectedItem(id);
        // setOpen(false);
        props.onSelect(id);
    };

    const onInputChangeHandler = (value: string) => {
        setNewInputValue(value);
        if (props.type === "input" && props.onChange) {
            props.onChange(value);
        }
    };

    return (
        <>
            <div
                className={`dropdown-item ${props.selectedId === props.id ? "is-active" : ""}`}
                onClick={(e) => selectItemHandler(e, props.id)} >

                {props.type === "text" && <span>{props.content}</span>}
                {props.type === "input" && <>
                    <Input className="is-small"
                        type="text"
                        id={props.id}
                        placeholder={props.placeholder? props.placeholder: "Enter"}
                        size={props.size}
                        initialValue={newInputValue}
                        onChange={onInputChangeHandler}
                        onSubmit={props.onSubmit}
                    />
                </>
                }
            </div>
            <hr className="dropdown-divider" />
        </>
    );
};

export default DropDownItem;