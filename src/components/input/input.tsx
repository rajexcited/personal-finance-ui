import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faInfoCircle, faCheck, faEdit, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./input.css";
import { InputValidateResponse } from "./input-validators";
import { getLogger } from "../../shared";


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
    labelInline?: boolean;
    onChange?(value: string): void;
    onBlur?(): void;
    onSubmit?(value: string): void;
    validate?(value: string): InputValidateResponse;
}

interface TextInputProps extends BaseInputProps {
    type: "text" | "email" | "password" | "tel";
    size?: number;
    maxlength?: number;
    minlength?: number;
    pattern?: string;
    autocomplete?: string;
}

interface NumberInputProps extends BaseInputProps {
    type: "number";
    step: number;
    min?: number;
    max?: number;
}

interface ColorInputProps extends BaseInputProps {
    type: "color";
}

export type InputProps =
    | TextInputProps
    | NumberInputProps
    | ColorInputProps;

export interface InputRef {
    triggerValidation: () => void;
}

const fcLogger = getLogger("FC.Input", null, null, "DISABLED");

const Input = forwardRef((props: InputProps, ref) => {
    const [inputValue, setInputValue] = useState(props.initialValue);
    const [isDisabled, setDisabled] = useState(!!props.disabled);
    const [isValid, setValid] = useState(true);
    const [isTouch, setTouch] = useState(false);
    const [error, setError] = useState("");
    const [inputType, setInputType] = useState(props.type);
    const [rightIcon, setRightIcon] = useState<IconProp | undefined>(props.rightIcon);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedTimeout = 300;
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (props.onChange && (isValid || inputValue === "")) {
                props.onChange(("" + inputValue).trim());
            }
        }, debouncedTimeout);

        const inpElm = inputRef.current;
        if (inpElm && inpElm.validity.valid !== isValid && isTouch && !isDisabled)
            setValid(inpElm.validity.valid);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [inputValue, isValid]);

    const validateInput = useMemo(() => {
        return (shouldReportValidity: boolean) => {
            let validity = true,
                errorMessage = null;
            // browser errors will be given priority
            let hasInputError = false;
            if (inputRef.current) {
                const validity = inputRef.current.validity;
                for (let key in validity) {
                    if (key !== "customError" && key !== "valid" && validity[key as keyof typeof validity]) {
                        hasInputError = true;
                        break;
                    }
                }
            }
            if (hasInputError) {
                validity = false;
            } else if (props.validate) {
                const validityObj = props.validate(inputValue);
                validity = validityObj.isValid;
                if (!validityObj.isValid) errorMessage = validityObj.errorMessage;
            }
            if (validity !== isValid) {
                setValid(validity);
                const inpElm = inputRef.current;
                if (inpElm) {
                    if (validity) {
                        inpElm.setCustomValidity("");
                        setError("");
                    } else {
                        if (errorMessage !== null) inpElm.setCustomValidity(errorMessage);
                        else inpElm.setCustomValidity("");

                        if (shouldReportValidity) inpElm.reportValidity();
                        else inpElm.checkValidity();

                        setError(inpElm.validationMessage);
                    }
                }
            } else if (!validity) {
                // in case of error state not change, display correct error message
                const inpElm = inputRef.current;
                if (inpElm) {
                    if (errorMessage !== null && errorMessage !== inpElm.validationMessage) {
                        inpElm.setCustomValidity(errorMessage);
                        setError(errorMessage);
                    } else if (errorMessage === null) {
                        if (inpElm.validity.customError) inpElm.setCustomValidity("");
                        if (error !== inpElm.validationMessage) {
                            setError(inpElm.validationMessage);
                        }
                    }
                }
            }
        };
    }, [inputValue, props.validate, props.required, inputRef, setValid, setError]);

    useEffect(() => {
        if (!isTouch) return;
        fcLogger.debug("useEffect for validation", "calling validateInput");
        validateInput(true);
    }, [inputValue, isTouch, props.validate, props.required, inputRef, setValid, setError]);

    useEffect(() => {
        if (props.disabled) setInputValue(props.initialValue);
        setDisabled(!!props.disabled);
    }, [props.initialValue, props.disabled]);

    useImperativeHandle(ref, (): InputRef => {
        return {
            triggerValidation: () => {
                setTimeout(() => {
                    fcLogger.debug("triggering input Validation for ", props.id);
                    validateInput(false);
                });
            }
        };
    });

    const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
        event.preventDefault();
        setTouch(true);
        setInputValue(event.target.value);
    };

    const onBlurHandler: React.FocusEventHandler<HTMLInputElement> = event => {
        event.preventDefault();
        setTouch(true);
        if (props.onBlur)
            props.onBlur();
    };

    const onClickHandler: React.MouseEventHandler<HTMLInputElement> = event => {
        if (!isDisabled) {
            setTouch(true);
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
                if (!isValid) return prev;
                setTouch(false);
                const disabled = (!!inputValue && !prev);
                if (disabled && inputValue && props.onSubmit) {
                    props.onSubmit(inputValue.trim());
                }
                return disabled;
            });
        }, debouncedTimeout);
    };

    if (props.type === "password" && inputType === "password" && rightIcon !== faEye) {
        setRightIcon(faEye);
    } else if (props.type === "password" && inputType === "text" && rightIcon !== faEyeSlash) {
        setRightIcon(faEyeSlash);
    }

    const onClickRightIconHandler: React.MouseEventHandler<HTMLSpanElement> = event => {
        if (props.type === "password") {
            event.preventDefault();
            event.stopPropagation();
            if (rightIcon === faEye) {
                setInputType("text");
            } else {
                setInputType("password");
            }
        }
    };

    let tooltip: JSX.Element | undefined;
    if (props.tooltip) {
        tooltip = <span className="icon has-text-info tooltip is-tooltip-multiline is-tooltip-right" data-tooltip={ props.tooltip }> <FontAwesomeIcon icon={ faInfoCircle } /> </span>;
    }

    const inputClasses = "input " + (props.className || "") + (isValid ? "" : " is-danger is-invalid");

    return (
        <div className={ `input-comp field ${props.labelInline ? "is-inline-flex" : ""}` }>
            <label htmlFor={ props.id }
                className={ `label ${props.label ? "" : "is-hidden"}` }>
                <span>{ props.label || props.id } </span>
                { tooltip }
            </label>
            <div className={ `control ${props.onSubmit ? "is-flex" : ""} ${props.leftIcon ? "has-icons-left" : ""} ${rightIcon ? "has-icons-right" : ""}` }>
                {
                    (props.type === "text" || props.type === "email" || props.type === "password" || props.type === "tel") &&
                    <input
                        ref={ inputRef }
                        type={ inputType }
                        name={ props.id }
                        id={ props.id }
                        placeholder={ props.placeholder }
                        size={ props.size }
                        maxLength={ props.maxlength }
                        minLength={ props.minlength }
                        pattern={ props.pattern }
                        value={ inputValue }
                        className={ inputClasses }
                        onChange={ onChangeHandler }
                        onBlur={ onBlurHandler }
                        disabled={ isDisabled }
                        onClick={ onClickHandler }
                        required={ props.required }
                        autoComplete={ props.autocomplete }
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
                    props.type === "color" &&
                    <input
                        ref={ inputRef }
                        type={ props.type }
                        name={ props.id }
                        id={ props.id }
                        value={ inputValue || "#000" }
                        className={ inputClasses }
                        onChange={ onChangeHandler }
                        onBlur={ onBlurHandler }
                        disabled={ isDisabled }
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
                    rightIcon &&
                    <span className="icon is-small is-right" onClick={ onClickRightIconHandler }>
                        <FontAwesomeIcon icon={ rightIcon } size={ "sm" } />
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
            { inputRef.current && !!inputRef.current.validationMessage && isTouch && !isDisabled &&
                <p className="help is-danger">{ inputRef.current.validationMessage }</p>
            }
        </div>
    );
});

export default Input;