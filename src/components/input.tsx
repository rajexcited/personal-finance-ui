import React, { FunctionComponent, useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle, faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import './input.css';

interface BaseInputProps {
    id: string;
    label?: string;
    leftIcon?: IconProp;
    rightIcon?: IconProp;
    tooltip?: string;
    tooltipPosition?: string;
    placeholder?: string;
    initialValue: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    onChange?(value: string): void;
    onBlur?(): void;
    onSubmit?(value: string): void;
}

interface TextInputProps extends BaseInputProps {
    type: "text";
    size?: number;
}

interface NumberInputProps extends BaseInputProps {
    type: "number";
    step: number;
    min?: number;
    max?: number;
}

export type InputProps =
    | TextInputProps
    | NumberInputProps;


const Input: FunctionComponent<InputProps> = (props) => {
    const [inputValue, setInputValue] = useState(props.initialValue);
    const [isDisabled, setDisabled] = useState(!!props.disabled);
    const [isInvalid, setInvalid] = useState(false);
    const inputRef = useRef<any>();

    const debouncedTimeout = 300;
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (props.onChange) {
                props.onChange(inputValue.trim());
            }
        }, debouncedTimeout);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [inputValue]);

    useEffect(() => {
        setInvalid(inputRef.current && !inputRef.current.validity.valid);
    }, [inputRef.current && inputRef.current.validity.valid]);

    const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
        event.preventDefault();
        setInputValue(event.target.value);
    };

    const onBlurHandler: React.FocusEventHandler<HTMLInputElement> = event => {
        event.preventDefault();
        if (props.onBlur)
            props.onBlur();
    };

    const onClickHandler: React.MouseEventHandler<HTMLInputElement> = event => {
        if (!isDisabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const submitHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        // special case. adding timeout to update the status against the correct input value.
        // input value onchange is debounced with 300ms, considering human click takes 
        // more than 100 ms after typing, this should work.
        setTimeout(() => {
            setDisabled(prev => {
                const disabled = (!!inputValue && !prev);
                if (disabled && inputValue && props.onSubmit) {
                    props.onSubmit(inputValue.trim());
                }
                return disabled;
            });
        }, debouncedTimeout);
    };


    let tooltip: JSX.Element | undefined;
    if (props.tooltip) {
        tooltip = <span className="icon has-text-info tooltip is-tooltip-multiline is-tooltip-right" data-tooltip={ props.tooltip }> <FontAwesomeIcon icon={ faInfoCircle } /> </span>;
    }

    const defaultClasses = `input ${props.className || ""}`;
    const inputClasses = defaultClasses + (isInvalid ? " is-danger is-invalid" : "");

    return (
        <div className="field">
            <label htmlFor={ props.id }
                className={ `label ${props.label ? "" : "is-hidden"}` }>
                <span>{ props.label || props.id } </span>
                { tooltip }
            </label>
            <div className={ `control ${props.onSubmit ? "is-flex" : ""} ${props.leftIcon ? "has-icons-left" : ""} ${props.rightIcon ? "has-icons-right" : ""}` }>
                {
                    props.type === "text" &&
                    <input
                        ref={ inputRef }
                        type={ props.type }
                        name={ props.id }
                        id={ props.id }
                        placeholder={ props.placeholder }
                        size={ props.size }
                        value={ inputValue }
                        className={ inputClasses }
                        onChange={ onChangeHandler }
                        onBlur={ onBlurHandler }
                        disabled={ isDisabled }
                        onClick={ onClickHandler }
                        required={ props.required }
                    />
                }
                {
                    props.type === "number" &&
                    <input
                        ref={ inputRef }
                        type={ props.type }
                        name={ props.id }
                        id={ props.id }
                        placeholder={ props.placeholder }
                        step={ props.step }
                        min={ props.min }
                        max={ props.max }
                        value={ inputValue }
                        className={ inputClasses }
                        onChange={ onChangeHandler }
                        onBlur={ onBlurHandler }
                        disabled={ isDisabled }
                        onClick={ onClickHandler }
                        required={ props.required }
                    />
                }

                {
                    props.leftIcon &&
                    <span className="icon is-small is-left">
                        <FontAwesomeIcon icon={ props.leftIcon } size={ "sm" } />
                    </span>
                }
                {
                    props.rightIcon &&
                    <span className="icon is-small is-right">
                        <FontAwesomeIcon icon={ props.rightIcon } size={ "sm" } />
                    </span>
                }
                { props.onSubmit &&
                    <button className="button is-small tooltip" onClick={ submitHandler } data-tooltip={ isDisabled ? "Edit" : "Ok" }>
                        <span className="icon is-small">
                            <FontAwesomeIcon icon={ isDisabled ? faEdit : faCheck } size={ "sm" } />
                        </span>
                    </button>
                }
            </div>
        </div>
    );
};

export default Input;