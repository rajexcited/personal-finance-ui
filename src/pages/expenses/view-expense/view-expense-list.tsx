import { FunctionComponent, useState, useContext, useEffect } from "react";
import { Th, SortDirection, LoadSpinner } from "../../../components";
import ExpenseTableRow from "./view-expense-item-tablerow";
import "./view-expense-list.css";
import { Header, rowHeaders, ExpenseContext, ExpenseFields } from "../store";
import { useNavigate } from "react-router-dom";
import { PAGE_URL } from "../../root/navigation";


interface ExpenseListProps { }

const ExpenseList: FunctionComponent<ExpenseListProps> = (props) => {
    const context = useContext(ExpenseContext);
    const [selectedRowId, setSelectedRowId] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    // one time call only, when component is initialized
    useEffect(() => {
        context.onInitExpenses();
    }, []);

    useEffect(() => {
        if (context.errorMessage !== errorMsg) {
            console.log("there is a change of error message, updating error state");
            setErrorMsg(context.errorMessage || '');
        }
    }, [context.errorMessage, errorMsg]);

    const onChangeSortDirection = (direction: SortDirection, rh: Header) => {
        if (!rh.sortable) return;
        if (rh.sortable) {
            const sortdetail = context.sortDetails[rh.datafieldKey];
            if (sortdetail) context.onChangeExpenseSort({ ...sortdetail, sortDirection: direction });
        }
    };

    const onEditRequestExpenseHandler = (expense: ExpenseFields, rowId: string) => {
        console.log("onEditRequestExpenseHandler");
        navigate(PAGE_URL.updateExpense.shortUrl.replace(":expenseId", expense.expenseId));
    };

    const onRemoveExpenseHandler = (expense: ExpenseFields, rowId: string) => {
        context.onRemoveExpense(expense);
    };

    console.log("loading", context.loading, "errormsg", errorMsg, "context.expenses.length", context.expenses.length);

    return (
        <section className="container">
            {/* <LoadSpinner loading={ context.loading } /> */ }
            {
                !context.loading && !!errorMsg &&
                <article className="message is-danger">
                    <div className="message-header">
                        <p>Oops!</p>
                        <button className="delete" aria-label="delete" onClick={ e => setErrorMsg('') }></button>
                    </div>
                    <div className="message-body">
                        { errorMsg }
                    </div>
                </article>
            }
            {
                !context.loading && !context.expenses.length &&
                <p className="title">There are no expenses</p>
            }
            {
                !!context.expenses.length &&
                <table className="table is-fullwidth is-hoverable">
                    <thead>
                        <tr>
                            {
                                rowHeaders.map(rh =>
                                    <Th label={ rh.label }
                                        sortable={ rh.sortable }
                                        key={ rh.label + "xpns-th" }
                                        sortdirection={ rh.sortable && context.sortDetails[rh.datafieldKey]?.sortDirection || "" }
                                        onChange={ (sortdirection) => onChangeSortDirection(sortdirection, rh) }
                                        type={ rh.sortable && rh.type || undefined }
                                    />
                                )
                            }
                        </tr>
                    </thead>
                    <tbody>
                        { context.expenses.map(xpns =>
                            <ExpenseTableRow
                                key={ xpns.expenseId + "-trow" }
                                id={ xpns.expenseId + "-trow" }
                                details={ xpns }
                                onSelect={ setSelectedRowId }
                                isSelected={ selectedRowId === (xpns.expenseId + "-trow") }
                                onEditRequest={ onEditRequestExpenseHandler.bind(null, xpns) }
                                onRemove={ onRemoveExpenseHandler.bind(null, xpns) }
                            />
                        ) }
                    </tbody>
                </table>
            }
        </section>
    );
};

export default ExpenseList;