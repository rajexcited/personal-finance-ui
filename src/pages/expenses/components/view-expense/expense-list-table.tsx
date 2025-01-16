import { FunctionComponent, useState, useEffect, useRef } from "react";
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
    const [renderedExpenseIds, setRenderedExpenseIds] = useState<Record<string, boolean>>({});
    const headerRef = useRef<ExpenseTableHeadRefType>(null);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[loaderData, actionData]", fcLogger);
        logger.debug("changes in expense list, so re-rendering");
        setRenderedExpenseIds(props.expenseList.reduce((obj: Record<string, true>, xpns) => {
            obj[xpns.id] = true;
            return obj;
        }, {}));
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
            logger.debug("sorting expense list");
            const result = getSortedExpenses(props.expenseList, sortMap, logger);
            if (result.length === 0) {
                logger.debug("expense list is empty so triggering render complete event");
                sleep("0.2 sec").then(props.onRenderCompleted);
            }
            return result;
        });
    }, [props.expenseList]);

    const onChangeExpenseSortHandler = (sortDetails: ExpenseSortStateType) => {
        const logger = getLogger("onChangeExpenseSortHandler", fcLogger);
        logger.debug("re-sort list requested, so re-rendering");
        setRenderedExpenseIds(props.expenseList.reduce((obj: Record<string, true>, xpns) => {
            obj[xpns.id] = true;
            return obj;
        }, {}));
        props.onRenderStart();
        logger.debug("sorting expenses and reloading with sortDetails =", sortDetails);
        setExpenseList(prev => {
            if (prev.length > 0) {
                logger.debug("sorting expense list");
                const newExp = getSortedExpenses(prev, sortDetails, logger);
                return newExp;
            }
            logger.debug("expense list is empty so triggering render complete event");
            sleep("0.2 sec").then(props.onRenderCompleted);
            return prev;
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

    fcLogger.debug("view expense list", "list of billname", expenseList.map(xpns => xpns.billName), [...expenseList]);

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
            logger.debug("item row render completed for expenseId =", expenseId, "updating rendering status to false to indicate render complete for expense");
            const obj = { ...prev };
            obj[expenseId] = false;
            if (Object.values(obj).every(v => v === false)) {
                sleep("30 ms").then(props.onRenderCompleted);
            }
            return obj;
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
                                startRendering={ !!renderedExpenseIds[xpns.id] }
                            />
                        )
                    }
                </tbody>
            </table>
        </section>
    );
};

