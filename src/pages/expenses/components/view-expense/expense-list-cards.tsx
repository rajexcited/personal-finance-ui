import { FunctionComponent, useEffect, useState } from "react";
import { ExpenseBelongsTo, ExpenseFields, ExpenseSortStateType, getLogger, getSortedExpenses, rowHeaders } from "../../services";
import { SelectedExpense } from "./common";
import { ExpenseItemCard } from "./expense-item-card";
import { SharePersonResource } from "../../../settings/services";
import { sleep } from "../../../../shared";


interface ExpenseListCardsProps {
    expenseList: ExpenseFields[];
    onRemove (expense: ExpenseFields): void;
    onViewReceipts (expense: ExpenseFields): void;
    onRenderCompleted (): void;
    onRenderStart (): void;
    sharePersons: SharePersonResource[];
}

const fcLogger = getLogger("FC.expense.view.ExpenseListCards", null, null, "DISABLED");

export const ExpenseListCards: FunctionComponent<ExpenseListCardsProps> = props => {
    const [expenseList, setExpenseList] = useState<ExpenseFields[]>([]);
    const [selectedExpense, setSelectedExpense] = useState<SelectedExpense>();
    const [renderedExpenseIds, setRenderedExpenseIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const logger = getLogger("useEffect.dep[loaderData, actionData]", fcLogger);
        logger.debug("changes in expense list, so re-rendering");
        setRenderedExpenseIds(props.expenseList.reduce((obj: Record<string, true>, xpns) => {
            obj[xpns.id] = true;
            return obj;
        }, {}));
        props.onRenderStart();
        setExpenseList(() => {
            const sortMap = rowHeaders.reduce((obj: ExpenseSortStateType, rh) => {
                if (rh.sortable) {
                    obj[rh.datafieldKey] = { ...rh };
                }
                return obj;
            }, {});
            logger.debug("sorting expense list");
            const result = getSortedExpenses(props.expenseList, sortMap, logger);
            if (result.length === 0) {
                logger.debug("expense list is empty so triggering render complete event");
                sleep("0.2 sec").then(props.onRenderCompleted);
            }
            return result;
        });
    }, [props.expenseList]);


    const onRemoveRequestHandler = (expenseSelected: ExpenseFields) => {
        setSelectedExpense(expenseSelected);
        props.onRemove(expenseSelected);
    };

    const onViewReceiptsRequestHandler = (expenseSelected: ExpenseFields) => {
        setSelectedExpense(expenseSelected);
        props.onViewReceipts(expenseSelected);
    };

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
            {
                expenseList.map(xpns =>
                    <ExpenseItemCard
                        key={ xpns.id + "-item-card" }
                        id={ xpns.id + "-item-card" }
                        details={ xpns }
                        onSelect={ onSelectRequestHandler }
                        isSelected={ selectedExpense?.id === xpns.id && selectedExpense.belongsTo === xpns.belongsTo }
                        onRemove={ onRemoveRequestHandler }
                        onViewReceipt={ onViewReceiptsRequestHandler }
                        onRenderCompleted={ onItemRowRenderCompletedHandler }
                        sharePersons={ props.sharePersons }
                        startRendering={ !!renderedExpenseIds[xpns.id] }
                    />

                )
            }

        </section>
    );
};

