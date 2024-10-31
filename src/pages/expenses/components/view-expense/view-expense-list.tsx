import { FunctionComponent, useState, useEffect, useRef } from "react";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Animated, ConfirmDialog, LoadSpinner } from "../../../../components";
import { rowHeaders, ExpenseSortStateType, getLogger, RouteHandlerResponse, ExpenseFields, ExpenseBelongsTo, getSortedExpenses } from "../../services";
import { getFullPath } from "../../../root";
import { useDebounceState } from "../../../../hooks";
import { ExpenseItemTableRow } from "./view-expense-item-tablerow";
import { ExpenseTableHead, ExpenseTableHeadRefType } from "./expense-table-head";
import { ViewReceipts } from "./receipt/view-receipts";


const fcLogger = getLogger("FC.expense.view.ExpenseList", null, null, "DISABLED");

type SelectedExpense = Pick<ExpenseFields, "id" | "belongsTo">;

export const ExpenseList: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<ExpenseFields[], null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [expenseList, setExpenseList] = useState<ExpenseFields[]>([]);
    const [selectedExpense, setSelectedExpense] = useState<SelectedExpense>();
    const [deletingExpense, setDeletingExpense] = useState<SelectedExpense>();
    const [isViewReceiptsEnable, setViewReceiptsEnable] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorDeletedExpense, setErrorDeletedExpense] = useState<SelectedExpense>();

    const submit = useSubmit();
    const [loading, setLoading] = useDebounceState(false, 500, true);
    const headerRef = useRef<ExpenseTableHeadRefType>(null);

    // do I need this useeffect? can i not set loader data directly to expenseList state?
    useEffect(() => {
        const logger = getLogger("useEffect.dep[loaderData, actionData]", fcLogger);
        if (loaderData.type === "success" && !actionData) {
            setLoading(true);
            setErrorMessage("");

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
                const result = getSortedExpenses(loaderData.data, sortMap, logger);
                setLoading(false);
                return result;
            });
        } else if (actionData?.type === "success") {
            setErrorMessage("");
        } else if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
        } else if (actionData?.type === "error") {
            setErrorMessage(actionData.errorMessage);
            setErrorDeletedExpense(selectedExpense);
        }
    }, [loaderData, actionData]);

    const onChangeExpenseSortHandler = (sortDetails: ExpenseSortStateType) => {
        const logger = getLogger("onChangeExpenseSortHandler", fcLogger);
        setLoading(true);
        logger.debug("sorting expenses and reloading with sortDetails =", sortDetails);
        setExpenseList(prev => {
            const newExp = getSortedExpenses(prev, sortDetails, logger);
            setLoading(false);
            return newExp;
        });
    };

    const onRemoveRequestHandler = (expenseId: string, belongsTo: ExpenseBelongsTo) => {
        const expenseSelected: SelectedExpense = { id: expenseId, belongsTo: belongsTo };
        setSelectedExpense(expenseSelected);
        setDeletingExpense(expenseSelected);
        setDeletingExpense(prev => {
            if (expenseId === prev?.id && belongsTo === prev.belongsTo) {
                return prev;
            }
            return undefined;
        });
    };

    const onViewReceiptsRequestHandler = (expenseId: string, belongsTo: ExpenseBelongsTo) => {
        const expenseSelected: SelectedExpense = { id: expenseId, belongsTo: belongsTo };
        setSelectedExpense(expenseSelected);
        setViewReceiptsEnable(true);
        setDeletingExpense(prev => {
            if (expenseId === prev?.id && belongsTo === prev.belongsTo) {
                return prev;
            }
            return undefined;
        });
    };

    const onDeleteConfirmHandler = () => {
        const expenseToBeDeleted = expenseList.find(xpns => xpns.id === deletingExpense?.id && xpns.belongsTo === deletingExpense.belongsTo);
        if (expenseToBeDeleted) {
            const data: any = { ...expenseToBeDeleted };
            submit(data, { action: getFullPath("expenseJournalRoot") + "?index", method: "delete" });
            setDeletingExpense(undefined);
            setErrorDeletedExpense(undefined);
        }
    };

    fcLogger.debug("view expense list", [...expenseList], "list of billname", expenseList.map(xpns => xpns.billName), "errorMessage =", errorMessage, "errorDeletedExpense =", errorDeletedExpense);
    const selectedExpenseReceipts = (isViewReceiptsEnable && expenseList.find(xpns => xpns.id === selectedExpense?.id && selectedExpense.belongsTo === xpns.belongsTo)?.receipts) || [];

    const onSelectRequestHandler = (expenseId: string, belongsTo: ExpenseBelongsTo) => {
        if (expenseId && belongsTo) {
            const expenseSelected: SelectedExpense = { id: expenseId, belongsTo: belongsTo };
            setSelectedExpense(expenseSelected);
            setDeletingExpense(prev => {
                if (expenseId === prev?.id && belongsTo === prev.belongsTo) {
                    return prev;
                }
                return undefined;
            });
        } else {
            setSelectedExpense(undefined);
        }
    };

    return (
        <section>
            <LoadSpinner loading={ loading } />

            <Animated animateOnMount={ false } isPlayIn={ !!errorMessage && !!errorDeletedExpense } animatedIn="fadeInDown" animatedOut="fadeOutUp" isVisibleAfterAnimateOut={ false } >
                <div className="columns is-centered">
                    <div className="column is-four-fifths">
                        <article className="message is-danger mb-3">
                            <div className="message-body">
                                <ReactMarkdown children={ errorMessage } />
                            </div>
                        </article>
                    </div>
                </div>
            </Animated>

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
                                isSelected={ selectedExpense?.id === xpns.id }
                                onRemove={ onRemoveRequestHandler }
                                onViewReceipt={ onViewReceiptsRequestHandler }
                            />
                        )
                    }
                    {
                        !expenseList.length &&
                        <tr>
                            <td colSpan={ rowHeaders.length }>
                                <p className="title">There are no expenses</p>
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
            <ConfirmDialog
                id="delete-expense-confirm-dialog"
                content="Are you sure that you want to delete expense?"
                title="Remove Expense"
                open={ !!deletingExpense?.id }
                onConfirm={ onDeleteConfirmHandler }
                onCancel={ () => setDeletingExpense(undefined) }
                yesButtonClassname="is-danger"
            />
            <ViewReceipts
                key={ "view-receipts-" + (isViewReceiptsEnable && selectedExpense?.id || "dummy") }
                isShow={ isViewReceiptsEnable }
                receipts={ selectedExpenseReceipts }
                onHide={ () => setViewReceiptsEnable(false) }
            />
        </section>
    );
};

