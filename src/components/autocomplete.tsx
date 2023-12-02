import { FunctionComponent, useState } from "react";

export interface AutocompleteProps {
    id: string;
    placeholder?: string;
    label?: string;
    data: string[];
}

const Autocomplete: FunctionComponent<AutocompleteProps> = (props) => {

    const [activeIndex, setActiveIndex] = useState(0);
    const [matches, setMatches] = useState<string[]>([]);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(false);

    // https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
    const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        console.log("keypress event", event);
        switch (event.key) {
            case "Enter":
            case "Tab":
                if (matches.length) {
                    setActiveIndex(0);
                    setMatches([]);
                    setQuery(matches[activeIndex]);
                    setSelected(true);
                }
                break;
            case "ArrowUp":
                setActiveIndex(activeIndex >= 1 ? activeIndex - 1 : 0);
                break;
            case "ArrowDown":
                setActiveIndex(activeIndex < matches.length - 1
                    ? activeIndex + 1
                    : matches.length - 1);
                break;
            default:
                break;
        }
    };

    const handleSelection = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
        , selection: string) => {
        console.log("handle selection click event");
        event.preventDefault();

        setActiveIndex(0);
        setQuery(selection);
        setMatches([]);
        setSelected(true);
    };

    const updateQuery: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        console.log("update query change event", event);
        if (!selected) {
            const newMatches = props.data.filter(item => item.toUpperCase().includes(event.target.value.toUpperCase()));
            setMatches(newMatches);
            setQuery(event.target.value);
            console.log(props.data, newMatches, event.target.value, event);
        } else {
            const nativeEvent = event.nativeEvent as InputEvent;
            if (nativeEvent.inputType === "deleteContentBackward") {
                setMatches([]);
                setQuery('');
                setSelected(false);
            }
        }
    };

    return (
        <div className="field">
            { props.label && <label className="label">{ props.label }</label> }
            <div className="control">
                <div className={ `dropdown ${matches.length > 0 ? "is-active" : ""}` }>
                    <div className="dropdown-trigger">
                        <input
                            type="text"
                            className="input"
                            name={ props.id }
                            id={ props.id }
                            value={ query }
                            onChange={ updateQuery }
                            onKeyDown={ handleKeyPress }
                            placeholder={ props.placeholder }
                        />
                    </div>
                    <div className="dropdown-menu">
                        { matches.length > 0 && (
                            <div className="dropdown-content">
                                { matches.map((match, index) => (
                                    <a
                                        className={ `dropdown-item ${index === activeIndex ? "is-active" : ""
                                            }` }
                                        href="/"
                                        key={ match }
                                        onClick={ event => handleSelection(event, match) }
                                    >
                                        { match }
                                    </a>
                                )) }
                            </div>
                        ) }
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Autocomplete;
