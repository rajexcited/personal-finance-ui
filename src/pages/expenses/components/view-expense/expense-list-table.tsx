import { FunctionComponent, useState, useEffect, useRef } from "react";
import { LoadSpinner } from "../../../../components";
import { rowHeaders, ExpenseSortStateType, getLogger, ExpenseFields, ExpenseBelongsTo, getSortedExpenses } from "../../services";
import { ExpenseItemTableRow } from "./view-expense-item-tablerow";
import { ExpenseTableHead, ExpenseTableHeadRefType } from "./expense-table-head";
import { SelectedExpense } from "./common";
import { sleep } from "../../../../shared";


interface ExpenseListTableProps {
    expenseList: ExpenseFields[];
    onRemove (expense: ExpenseFields): void;
    onViewReceipts (expense: ExpenseFields): void;
    onRenderCompleted (): void;
    onRenderStart (): void;
}

const fcLogger = getLogger("FC.expense.view.ExpenseListTable", null, null, "DISABLED");

export const ExpenseListTable: FunctionComponent<ExpenseListTableProps> = props => {
    const [expenseList, setExpenseList] = useState<ExpenseFields[]>([]);
    const [selectedExpense, setSelectedExpense] = useState<SelectedExpense>();
    const [renderedExpenseIds, setRenderedExpenseIds] = useState<string[]>([]);
    const headerRef = useRef<ExpenseTableHeadRefType>(null);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[loaderData, actionData]", fcLogger);
        logger.debug("changes in expense list, so re-rendering");
        setRenderedExpenseIds([]);
        props.onRenderStart();
        setExpenseList(() => {
            let sortMap;
            if (headerRef.current && Object.keys(headerRef.current.sortDetails()).length) {
                sortMap = headerRef.current.sortDetails();
            } else {
                sortMap = rowHeaders.reduce((obj: ExpenseSortStateType, rh) => {
                    if (rh.sortable) {
                        obj[rh.datafieldKey] = { ...rh };
                    }
                    return obj;
                }, {});
            }
            const result = getSortedExpenses(props.expenseList, sortMap, logger);
            if (result.length === 0) {
                sleep("0.3 sec").then(props.onRenderCompleted);
            }
            return result;
        });
    }, [props.expenseList]);

    const onChangeExpenseSortHandler = (sortDetails: ExpenseSortStateType) => {
        const logger = getLogger("onChangeExpenseSortHandler", fcLogger);
        setRenderedExpenseIds([]);
        props.onRenderStart();
        logger.debug("sorting expenses and reloading with sortDetails =", sortDetails);
        setExpenseList(prev => {
            const newExp = getSortedExpenses(prev, sortDetails, logger);
            // setLoading(false);
            return newExp;
        });
    };

    const onRemoveRequestHandler = (expenseSelected: ExpenseFields) => {
        setSelectedExpense({ id: expenseSelected.id, belongsTo: expenseSelected.belongsTo });
        props.onRemove(expenseSelected);
    };

    const onViewReceiptsRequestHandler = (expenseSelected: ExpenseFields) => {
        setSelectedExpense({ id: expenseSelected.id, belongsTo: expenseSelected.belongsTo });
        props.onViewReceipts(expenseSelected);
    };

    fcLogger.debug("view expense list", [...expenseList], "list of billname", expenseList.map(xpns => xpns.billName));

    const onSelectRequestHandler = (expenseId: string, belongsTo: ExpenseBelongsTo) => {
        if (expenseId && belongsTo) {
            const expenseSelected: SelectedExpense = { id: expenseId, belongsTo: belongsTo };
            setSelectedExpense(expenseSelected);
        } else {
            setSelectedExpense(undefined);
        }
    };

    const onItemRowRenderCompletedHandler = (expenseId: string) => {
        const logger = getLogger("onItemRowRenderCompletedHandler", fcLogger);
        setRenderedExpenseIds(prev => {
            const newList = [...prev, expenseId];
            logger.debug("item row render completed for expenseId =", expenseId, "newList.length=", newList.length, "expenseList.length=", expenseList.length);
            if (newList.length === expenseList.length) {
                sleep("0.3 sec").then(props.onRenderCompleted);
            }
            return newList;
        });
    };

    return (
        <section className="mb-5">

            <table className="table is-fullwidth is-hoverable">
                <ExpenseTableHead
                    ref={ headerRef }
                    onChangeExpenseSort={ onChangeExpenseSortHandler }
                />
                <tbody>
                    {
                        expenseList.map(xpns =>
                            <ExpenseItemTableRow
                                key={ xpns.id + "-trow" }
                                id={ xpns.id + "-trow" }
                                details={ xpns }
                                onSelect={ onSelectRequestHandler }
                                isSelected={ selectedExpense?.id === xpns.id && selectedExpense.belongsTo === xpns.belongsTo }
                                onRemove={ onRemoveRequestHandler }
                                onViewReceipt={ onViewReceiptsRequestHandler }
                                onRenderCompleted={ onItemRowRenderCompletedHandler }
                            />
                        )
                    }
                </tbody>
            </table>
        </section>
    );
};

