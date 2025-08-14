import { FunctionComponent, useState, useEffect } from "react";
import { testAttributes } from "../shared";

export interface TextAreaProps {
    id: string;
    label: string;
    placeholder?: string;
    cols?: number;
    rows?: number;
    maxlength?: number;
    value: string;
    className?: string;
    onChange (value: string): void;
}

const TextArea: FunctionComponent<TextAreaProps> = (props) => {
    const [inputValue, setInputValue] = useState(props.value);

    const debouncedTimeout = 300;
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            props.onChange(inputValue);
        }, debouncedTimeout);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [inputValue]);

    const onChangeHandler: React.ChangeEventHandler<HTMLTextAreaElement> = event => {
        event.preventDefault();
        setInputValue(event.target.value);
    };

    return (
        <div className="field">
            <label htmlFor={ props.id } className="label">{ props.label }</label>
            <div className="control">
                <textarea
                    name={ props.id }
                    id={ props.id }
                    placeholder={ props.placeholder }
                    cols={ props.cols }
                    rows={ props.rows }
                    maxLength={ props.maxlength }
                    className={ `textarea ${props.className}` }
                    value={ inputValue }
                    onChange={ onChangeHandler }
                />
            </div>

            <p className="help is-info has-text-right" { ...testAttributes(props.id + "-counter") }>
                { "counter: " + inputValue.length + (props.maxlength ? "/" + props.maxlength : "") }
            </p>
        </div>
    );
};

export default TextArea;