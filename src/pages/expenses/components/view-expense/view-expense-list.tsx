import { FunctionComponent, useState, useEffect, useRef } from "react";
import { useActionData, useLoaderData, useNavigate, useSubmit } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Animated, ConfirmDialog, LoadSpinner } from "../../../../components";
import { rowHeaders, PurchaseFields, expenseComparator, ExpenseSortStateType } from "../../services";
import { getFullPath } from "../../../root";
import { useDebounceState } from "../../../../hooks";
import { ExpenseItemTableRow } from "./view-expense-item-tablerow";
import { ExpenseTableHead, ExpenseTableHeadRefType } from "./expense-table-head";
import "./view-expense-list.css";
import { RouteHandlerResponse, difference, getLogger } from "../../../../services";
import { ViewReceipts } from "./receipt/view-receipts";

const fcLogger = getLogger("FC.expense.view.ExpenseList", null, null, "INFO");
let prevSortDetails: ExpenseSortStateType | null = null;
const getPrevSortDetails = (sortDetails: ExpenseSortStateType) => {
    if (!prevSortDetails) {
        prevSortDetails = sortDetails;
    }
    return prevSortDetails;
};

export const ExpenseList: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<PurchaseFields[], null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [expenseList, setExpenseList] = useState<PurchaseFields[]>([]);
    const [selectedExpenseId, setSelectedExpenseId] = useState("");
    const [deletingExpenseId, setDeletingExpenseId] = useState("");
    const [isViewReceiptsEnable, setViewReceiptsEnable] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const submit = useSubmit();
    const [loading, setLoading] = useDebounceState(false, 500, true);
    const headerRef = useRef<ExpenseTableHeadRefType>(null);

    // do I need this useeffect? can i not set loader data directly to expenseList state?
    useEffect(() => {
        if (loaderData.type === "success") {
            setLoading(true);
            setErrorMessage("");

            if (headerRef && headerRef.current && Object.keys(headerRef.current.sortDetails()).length) {
                setExpenseList(getSortedExpenses(loaderData.data, headerRef.current.sortDetails()));
            } else {
                const initialSortDetails: ExpenseSortStateType = {};
                rowHeaders.forEach(rh => {
                    if (rh.sortable) {
                        initialSortDetails[rh.datafieldKey] = { ...rh };
                    }
                });
                setExpenseList(getSortedExpenses(loaderData.data, initialSortDetails));
            }
        } else if (actionData?.type === "success") {
            setErrorMessage("");
        } else if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
        }
        else if (actionData?.type === "error") {
            setErrorMessage(actionData.errorMessage);
        }
    }, [loaderData, actionData]);

    const getSortedExpenses = (expenses: PurchaseFields[], sortDetails: ExpenseSortStateType): PurchaseFields[] => {
        const logger = getLogger("getSortedExpenses", fcLogger);
        const sortedExpenses = [...expenses];
        sortedExpenses.sort(expenseComparator.bind(null, sortDetails));
        logger.debug("sortDetails", JSON.stringify(sortDetails), "diff: ", difference(sortDetails, getPrevSortDetails(sortDetails)));
        return sortedExpenses;
    };

    const onChangeExpenseSortHandler = (sortDetails: ExpenseSortStateType) => {
        setLoading(true);
        setExpenseList(prev => {
            const newExp = getSortedExpenses(prev, sortDetails);
            setTimeout(() => {
                setLoading(false);
            }, 10);
            return newExp;
        });
    };

    const onEditRequestExpenseHandler = (expenseId: string) => {
        fcLogger.info("debug - getFullPath=", getFullPath("updatePurchase", expenseId));
        navigate(getFullPath("updatePurchase", expenseId));
    };

    const onRemoveRequestHandler = (expenseId: string) => {
        setSelectedExpenseId(expenseId);
        setDeletingExpenseId(expenseId);
    };

    const onViewReceiptsRequestHandler = (expenseId: string) => {
        setSelectedExpenseId(expenseId);
        setViewReceiptsEnable(true);
    };

    const onDeleteConfirmHandler = () => {
        const deletingExpense = expenseList.find(xpns => xpns.id === deletingExpenseId);
        const data: any = { ...deletingExpense };
        submit(data, { action: getFullPath("expenseJournalRoot"), method: "delete" });
        setDeletingExpenseId("");
    };

    fcLogger.debug(new Date(), "view expense list", [...expenseList], "list of billname", expenseList.map(xpns => xpns.billName));
    const selectedExpenseReceipts = (isViewReceiptsEnable && expenseList.find(xpns => xpns.id === selectedExpenseId)?.receipts) || [];

    return (
        <section>
            <LoadSpinner loading={ loading } />

            <Animated animateOnMount={ false } isPlayIn={ !!errorMessage } animatedIn="fadeInDown" animatedOut="fadeOutUp" isVisibleAfterAnimateOut={ false } >
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
                                onSelect={ setSelectedExpenseId }
                                isSelected={ selectedExpenseId === xpns.id }
                                onEditRequest={ onEditRequestExpenseHandler }
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
                open={ !!deletingExpenseId }
                onConfirm={ onDeleteConfirmHandler }
                onCancel={ () => setDeletingExpenseId("") }
                yesButtonClassname="is-danger"
            />
            <ViewReceipts
                key={ "view-receipts-" + (isViewReceiptsEnable ? selectedExpenseId : "dummy") }
                isShow={ isViewReceiptsEnable }
                receipts={ selectedExpenseReceipts }
                onHide={ () => setViewReceiptsEnable(false) }
            />
        </section>
    );
};

