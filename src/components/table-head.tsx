import { faArrowDown, faArrowUp, faArrowsUpDown, faSortAlphaDown, faSortAlphaUp, faSortAmountDown, faSortAmountUp, faSortNumericDown, faSortNumericUp, faUpDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useDebounceState } from "../hooks";
import { getLogger, testAttributes } from "../shared";

export type SortDirection = "asc" | "desc" | "";
const directions: SortDirection[] = ["", "asc", "desc"];

export type SortType = "amount" | "alpha" | "number";
const fcLogger = getLogger("FC.Th", null, null, "DISABLED");

const rotate = (val: SortDirection, arr: SortDirection[]): SortDirection => {
    let ind = arr.indexOf(val);
    ind = ind + 1;
    ind = ind % arr.length;
    const next = arr[ind] as SortDirection;
    return next;
};

export interface ThProps {
    label: string;
    sortable: boolean;
    sortdirection?: SortDirection;
    className?: string;
    onChange?(sortdirection: SortDirection): void;
    type?: SortType;
}

const Th: FunctionComponent<ThProps> = (props) => {
    const [sortdirection, setSortdirection] = useState(props.sortdirection || directions[0]);
    const [sortdirectionChange, setSortdirectionChange] = useDebounceState(!!props.sortdirection, 500, true);

    useEffect(() => {
        setSortdirection(prev => props.sortdirection || prev);
    }, [props.sortdirection]);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[sortdirectionChange]", fcLogger);
        logger.debug(" props.sortdirection =", props.sortdirection, " props.onChange =", props.onChange, " sortdirectionChange =", sortdirectionChange, " sortdirection =", sortdirection);
        if (props.sortdirection !== undefined && props.onChange) {
            props.onChange(sortdirection);
        }
    }, [sortdirectionChange]);

    const onClickCellHandler: React.MouseEventHandler<HTMLTableCellElement> = event => {
        const logger = getLogger("onClickCellHandler", fcLogger);
        event.preventDefault();
        logger.debug("props.sortdirection =", props.sortdirection, " props.onChange =", props.onChange);
        if (props.sortdirection !== undefined && props.onChange) {
            setSortdirection(sd => {
                const newsd = rotate(sd, directions);
                logger.debug(" sd =", sd, "newsd =", newsd, "directions =", directions);
                return newsd;
            });
            setSortdirectionChange(prev => {
                const curr = !prev;
                logger.debug("prev =", prev, "curr =", curr);
                return curr;
            });
        }
    };

    let icon = undefined;
    if (props.sortable) {
        if (!props.type) {
            icon = sortdirection === "desc" ? faArrowDown : sortdirection ? faArrowUp : faUpDown;
        } else if (props.type === "amount") {
            icon = sortdirection === "desc" ? faSortAmountDown : sortdirection ? faSortAmountUp : faArrowsUpDown;
        } else if (props.type === "number") {
            icon = sortdirection === "desc" ? faSortNumericDown : sortdirection ? faSortNumericUp : faArrowsUpDown;
        } else if (props.type === "alpha") {
            icon = sortdirection === "desc" ? faSortAlphaDown : sortdirection ? faSortAlphaUp : faArrowsUpDown;
        }
    }

    return (
        <th onClick={ onClickCellHandler }
            className={ `${props.className || ""} ${props.sortable ? "is-clickable" : ""}` }>
            <span className="icon-text">
                {
                    icon &&
                    <span className="icon">
                        <FontAwesomeIcon icon={ icon } />
                    </span>
                }
                <span> { props.label } </span>
            </span>
        </th>
    );
};

export default Th;