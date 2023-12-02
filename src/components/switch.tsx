import "bulma-extensions/bulma-switch/dist/css/bulma-switch.min.css";
import "./switch.css";
import { FunctionComponent, useState } from "react";


interface SwitchProps {
    id: string;
    initialStatus?: boolean;
    label?: string;
    labelWhenOn?: string;
    labelWhenOff?: string;
    tooltip?: string;
    tooltipWhenOn?: string;
    tooltipWhenOff?: string;
    onChange (status: boolean): void;
}

/**
 * doc link - https://wikiki.github.io/form/switch/
 */
const Switch: FunctionComponent<SwitchProps> = (props) => {
    const id = props.id + "switchcheck";
    const [status, setStatus] = useState(!!props.initialStatus);
    const tooltipContent = (status && props.tooltipWhenOn) || (!status && props.tooltipWhenOff) || props.tooltip;
    const label = (status && props.labelWhenOn) || (!status && props.labelWhenOff) || props.label;

    const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
        // event.preventDefault();
        const isChecked = event.target.checked;
        setStatus(isChecked);
        props.onChange(isChecked);
    };

    return (
        <div className={ `switch-container field ${!tooltipContent ? "" : "tooltip"}` } data-tooltip={ tooltipContent }>
            <input id={ id } type="checkbox" className="switch is-rounded is-info" defaultChecked={ status } onChange={ onChangeHandler } />
            <label htmlFor={ id }>{ label }</label>
        </div>
    );
};

export default Switch;