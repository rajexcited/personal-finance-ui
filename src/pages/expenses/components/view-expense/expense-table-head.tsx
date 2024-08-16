import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ExpenseSortStateType, Header, rowHeaders } from "../../services";
import { SortDirection, Th } from "../../../../components";

interface ExpenseTableHeadProps {
    onChangeExpenseSort (sortDetails: ExpenseSortStateType): void;
}

export interface ExpenseTableHeadRefType {
    sortDetails (): ExpenseSortStateType;
}

export const ExpenseTableHead = forwardRef<ExpenseTableHeadRefType, ExpenseTableHeadProps>((props, ref) => {
    const [sortDetails, setSortDetails] = useState<ExpenseSortStateType>({});

    useEffect(() => {
        const newHdrState: ExpenseSortStateType = {};
        rowHeaders.forEach(rh => {
            if (rh.sortable) {
                newHdrState[rh.datafieldKey] = { ...rh };
            }
        });
        setSortDetails(newHdrState);
    }, []);

    useImperativeHandle(ref, () => ({
        sortDetails: () => sortDetails
    }), [sortDetails]);

    const onChangeSortDirection = (direction: SortDirection, rh: Header) => {
        if (!rh.sortable) return;
        if (rh.sortable) {
            const sortdetail = sortDetails[rh.datafieldKey];
            if (sortdetail) {
                setSortDetails(prev => {
                    const updatedState = { ...prev };
                    updatedState[rh.datafieldKey] = { ...sortdetail, sortDirection: direction };
                    Promise
                        .resolve({ ...updatedState })
                        .then(props.onChangeExpenseSort);
                    return updatedState;
                });
            }
        }
    };

    return (
        <thead>
            <tr>
                {
                    rowHeaders.map(rh =>
                        <Th label={ rh.label }
                            sortable={ rh.sortable }
                            key={ rh.label + "xpns-th" }
                            sortdirection={ rh.sortable && sortDetails[rh.datafieldKey]?.sortDirection || "" }
                            onChange={ (sortdirection) => onChangeSortDirection(sortdirection, rh) }
                            type={ rh.sortable && rh.type || undefined }
                        />
                    )
                }
            </tr>
        </thead>
    );
});

