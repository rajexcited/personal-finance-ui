import { FunctionComponent, useState, useEffect, useRef } from "react";
import { useActionData, useLoaderData, useNavigate, useSubmit } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Animated, ConfirmDialog, LoadSpinner } from "../../../../components";
import { rowHeaders, ExpenseFields, expenseComparator, ExpenseSortStateType } from "../../services";
import { PAGE_URL } from "../../../root";
import { useDebounceState } from "../../../../hooks";
import ExpenseTableRow from "./view-expense-item-tablerow";
import ExpenseTableHead, { ExpenseTableHeadRefType } from "./expense-table-head";
import "./view-expense-list.css";
import { difference } from "../../../../services";
import ViewReceipts from "./view-receipts";


declare global {
    interface Window {
        prevSortDetails: any;
    }
}

const ExpenseList: FunctionComponent = () => {
    const loaderData = useLoaderData() as ExpenseFields[];
    const actionData = useActionData() as { errorMessage: string; };
    const [expenseList, setExpenseList] = useState<ExpenseFields[]>([]);
    const [selectedExpenseId, setSelectedExpenseId] = useState("");
    const [deletingExpenseId, setDeletingExpenseId] = useState("");
    const [isViewReceiptsEnable, setViewReceiptsEnable] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const submit = useSubmit();
    const [loading, setLoading] = useDebounceState(false, 500, true);
    const headerRef = useRef<ExpenseTableHeadRefType>(null);

    // do I need this useeffect? can i not set loader data directly to expenseList state?
    useEffect(() => {
        if (Array.isArray(loaderData) && loaderData.length !== expenseList.length) {
            setLoading(true);
            const sortDetails: ExpenseSortStateType = {};
            if (headerRef && headerRef.current && Object.keys(headerRef.current.sortDetails()).length) {
                setExpenseList(getSortedExpenses(loaderData, headerRef.current.sortDetails()));
            } else {
                const initialSortDetails: ExpenseSortStateType = {};
                rowHeaders.forEach(rh => {
                    if (rh.sortable) {
                        initialSortDetails[rh.datafieldKey] = { ...rh };
                    }
                });
                setExpenseList(getSortedExpenses(loaderData, initialSortDetails));
            }
        }
        if (actionData?.errorMessage && errorMsg !== actionData.errorMessage) {
            // should i seperate the use effect since both have different outcomes?
            setErrorMsg(actionData?.errorMessage);
        }
    }, [loaderData, actionData]);

    const getSortedExpenses = (expenses: ExpenseFields[], sortDetails: ExpenseSortStateType): ExpenseFields[] => {
        const sortedExpenses = [...expenses];
        sortedExpenses.sort(expenseComparator.bind(null, sortDetails));
        // console.log("getSortedExpenses", new Date(), "sortDetails", JSON.stringify(sortDetails), "diff: ", difference(sortDetails, window.prevSortDetails || sortDetails));
        window.prevSortDetails = sortDetails;
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
        navigate(PAGE_URL.updateExpense.shortUrl.replace(":expenseId", expenseId));
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
        const deletingExpense = expenseList.find(xpns => xpns.expenseId === deletingExpenseId);
        const data: any = { ...deletingExpense };
        submit(data, { action: PAGE_URL.expenseJournalRoot.fullUrl, method: "delete" });
        setDeletingExpenseId("");
    };

    // console.log(new Date(), "view expense list", [...expenseList], "list of billname", expenseList.map(xpns => xpns.billname));

    return (
        <section>
            <LoadSpinner loading={ loading } />

            <Animated animateOnMount={ false } isPlayIn={ !!errorMsg } animatedIn="fadeInDown" animatedOut="fadeOutUp" isVisibleAfterAnimateOut={ false } >
                <div className="columns is-centered">
                    <div className="column is-four-fifths">
                        <article className="message is-danger mb-3">
                            <div className="message-body">
                                <ReactMarkdown children={ errorMsg } />
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
                            <ExpenseTableRow
                                key={ xpns.expenseId + "-trow" }
                                id={ xpns.expenseId + "-trow" }
                                details={ xpns }
                                onSelect={ setSelectedExpenseId }
                                isSelected={ selectedExpenseId === xpns.expenseId }
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
                receipts={ isViewReceiptsEnable && expenseList.find(xpns => xpns.expenseId === selectedExpenseId)?.receipts || [] }
                onHide={ () => setViewReceiptsEnable(false) }
            />
        </section>
    );
};

export default ExpenseList;