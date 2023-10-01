import { faArrowDown, faArrowUp, faArrowsUpDown, faSortAlphaDown, faSortAlphaUp, faSortAmountDown, faSortAmountUp, faSortDown, faSortNumericDown, faSortNumericUp, faSortUp, faUpDown, faUpRightAndDownLeftFromCenter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useDebounceState } from "../hooks";

export type SortDirection = "asc" | "desc" | "";
const directions: SortDirection[] = ["", "asc", "desc"];

export type SortType = "amount" | "alpha" | "number";

const rotate = (val: string, arr: string[]): SortDirection => {
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
    const [sortdirectionChange, setSortdirectionChange] = useDebounceState(false, 700);

    useEffect(() => {
        if (props.sortdirection !== undefined && props.onChange) {
            props.onChange(sortdirection);
        }
    }, [sortdirectionChange]);

    const onClickCellHandler: React.MouseEventHandler<HTMLTableCellElement> = event => {
        event.preventDefault();
        if (props.sortdirection !== undefined && props.onChange) {
            setSortdirection(sd => rotate(sd, directions));
            setSortdirectionChange(prev => !prev);
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
        <th onClick={ onClickCellHandler } className={ `${props.className || ""} ${props.sortable ? "is-clickable" : ""}` }>
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