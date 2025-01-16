import { FunctionComponent, useEffect, useState } from "react";
import { getLogger } from "../shared";

interface RadioItemProp {
    label: string;
    id: string;
    tooltip: string;
}

interface RadioProps {
    name: string;
    items: string[];
    selectedItem: string;
    label: string;
    onChange (value: string): void;
    disable?: boolean;
}

const fcLogger = getLogger("FC.Radio", null, null, "DISABLED");

export const Radio: FunctionComponent<RadioProps> = (props) => {
    const [items, setItems] = useState<RadioItemProp[]>([]);
    const [selectedItem, setSelectedItem] = useState("");

    useEffect(() => {
        const logger = getLogger("useEffect.dep[props.items]", fcLogger);

        const ritems: RadioItemProp[] = props.items.map(itm => ({ id: encodeURIComponent(itm), label: itm, tooltip: itm }));
        logger.debug("created new radio items=", ritems);
        const itemLabels = items.map(itm => itm.label);
        const isAllMatched = ritems.every(itm => itemLabels.includes(itm.label));
        logger.debug("isAllMatched=", isAllMatched);
        if (!isAllMatched) {
            setItems(ritems);
            logger.debug("selectedItem=", props.selectedItem);
            setSelectedItem(props.selectedItem);
        }
    }, [props.items]);

    const onClickSelectHandler = (event: React.MouseEvent<HTMLLabelElement>, ritem: RadioItemProp) => {
        const logger = getLogger("onClickSelectHandler", fcLogger);
        event.preventDefault();
        logger.debug("event=", event, "radioItem=", ritem, "ritem already selected?", (ritem.id === selectedItem));

        if (props.disable !== true && ritem.id !== selectedItem) {
            logger.debug("triggering onchange with new selected radio item", ritem.label);
            props.onChange(ritem.label);
            setSelectedItem(ritem.label);
        }
    };


    return (
        <div className="field radio-container">
            <div className="control ">
                <label className="label"> { props.label } : </label>
                <div className="radios">
                    {
                        items.map(itm =>
                            <label
                                className="radio tooltip"
                                aria-disabled={ props.disable }
                                key={ itm.id }
                                data-tooltip={ itm.tooltip }
                                onClick={ e => onClickSelectHandler(e, itm) }>

                                <input
                                    type="radio"
                                    name={ props.name }
                                    value={ itm.label }
                                    defaultChecked={ itm.label === selectedItem }
                                    disabled={ itm.label !== selectedItem && props.disable }
                                />
                                &nbsp;{ itm.label }&nbsp;
                            </label>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

