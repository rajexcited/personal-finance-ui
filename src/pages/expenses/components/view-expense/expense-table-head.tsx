import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ExpenseSortFieldKey, ExpenseSortStateType, getLogger, Header, rowHeaders } from "../../services";
import { SortDirection, Th } from "../../../../components";
import { ExpenseSortDetails } from "../../services/expense/sort-headers";

interface ExpenseTableHeadProps {
    onChangeExpenseSort (sortDetails: ExpenseSortStateType): void;
}

export interface ExpenseTableHeadRefType {
    sortDetails (): ExpenseSortStateType;
}

const fcLogger = getLogger("FC.expense.view.ExpenseTableHead", null, null, "INFO");

export const ExpenseTableHead = forwardRef<ExpenseTableHeadRefType, ExpenseTableHeadProps>((props, ref) => {
    const [sortDetails, setSortDetails] = useState<ExpenseSortStateType>({});

    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);
        const newHdrState: ExpenseSortStateType = {};
        rowHeaders.forEach(rh => {
            if (rh.sortable) {
                newHdrState[rh.datafieldKey] = { ...rh };
            }
        });
        logger.debug("newHdrState =", JSON.parse(JSON.stringify(newHdrState)), " being configured to setSortDetails");
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
                    const updatedState: ExpenseSortStateType = { ...prev };
                    updatedState[rh.datafieldKey] = { ...sortdetail, sortDirection: direction, sortLevel: 0 };
                    const resolvingState = updatedState;
                    Object.keys(updatedState).forEach((key) => {
                        const newSortDetails = resolvingState[key as ExpenseSortFieldKey] = { ...updatedState[key as ExpenseSortFieldKey] } as ExpenseSortDetails;
                        if (!newSortDetails.sortDirection) {
                            newSortDetails.sortLevel = undefined;
                        }
                        if (newSortDetails.sortLevel !== undefined) {
                            newSortDetails.sortLevel = newSortDetails.sortLevel + 1;
                        }
                    });
                    Promise
                        .resolve({ ...resolvingState })
                        .then(props.onChangeExpenseSort);
                    return resolvingState;
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

