import { FunctionComponent, useState, useRef } from "react";
import { faSquarePlus, faSquareMinus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VerifyIndicator } from "../../../components";
import { CategoryService } from "../services";
import dateutil from "date-and-time";
import { ExpenseFields } from "../store";


const categoryService = CategoryService();

interface ExpenseItemTableRowProps {
    id: string;
    details: ExpenseFields;
    onSelect (id: string): void;
    isSelected: Boolean;
    onRemove (id: string): void;
    onEditRequest (id: string): void;
}

const ExpenseItemTableRow: FunctionComponent<ExpenseItemTableRowProps> = (props) => {
    const [showBreakdown, setShowBreakdown] = useState(false);
    const rowRef = useRef<HTMLTableRowElement>(null);

    const onClickToggleBreakdownRows: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        setShowBreakdown(prev => !prev);
    };

    const onClickToggleRowSelection: React.MouseEventHandler<HTMLTableRowElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        if (props.isSelected) props.onSelect("");
        else props.onSelect(props.id);
    };

    const onClickTrashExpense: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onRemove(props.id);
    };

    const onClickonEditStartExpense: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onEditRequest(props.id);
    };

    const itemizeAmounts = props.details.expenseItems && props.details.expenseItems.map(it => Number(it.amount)).filter(n => !isNaN(n));
    let totalItemizedAmount = 0;
    if (itemizeAmounts) {
        totalItemizedAmount = itemizeAmounts.reduce((t, n) => t + n, 0);
    }
    const expenseAmount = isNaN(Number(props.details.amount)) ? 0 : Number(props.details.amount);
    const diffAmount = expenseAmount - totalItemizedAmount;

    const getShortForm = (text?: string | string[]) => {
        if (Array.isArray(text)) {
            text = text.join();
        }
        return text && text.length > 15 ? text.substring(0, 12).concat("...") : text;
    };

    const formatAmount = (amt?: string | number) => {
        const amtt = amt && Number(amt) || 0;
        return "$ " + amtt.toFixed(2);
    };

    let itemBreakdownAction;
    if (showBreakdown) {
        itemBreakdownAction = (<a className="is-link" onClick={ onClickToggleBreakdownRows } key={ "item-breakdown" + props.id }>
            <span className="icon tooltip" data-tooltip="Hide Breakdown">
                <FontAwesomeIcon icon={ faSquarePlus } />
            </span>
        </a>);
    } else {
        itemBreakdownAction = (<a className="is-link" onClick={ onClickToggleBreakdownRows } key={ "item-breakdown" + props.id }>
            <span className="icon tooltip" data-tooltip="Show Breakdown">
                <FontAwesomeIcon icon={ faSquareMinus } />
            </span>
        </a>);
    }

    const updateExpenseAction = (<a className="is-link" onClick={ onClickonEditStartExpense } key={ "updt-xpns" + props.id }>
        <span className="icon tooltip" data-tooltip="Update Expense">
            <FontAwesomeIcon icon={ faEdit } />
        </span>
    </a>);

    const removeExpenseAction = (<a className="is-link" onClick={ onClickTrashExpense } key={ "rmve-xpns" + props.id }>
        <span className="icon tooltip" data-tooltip="Remove Expense">
            <FontAwesomeIcon icon={ faTrash } />
        </span>
    </a>);

    const actions = [];
    if (!!props.details.expenseItems && !!props.details.expenseItems.length) {
        actions.push(itemBreakdownAction);
    }
    actions.push(updateExpenseAction, removeExpenseAction);

    return (
        <>
            <tr ref={ rowRef } onClick={ onClickToggleRowSelection } className={ props.isSelected ? "is-selected" : "" }>
                <td>{ props.details.pymtacc || "-" }</td>
                <td>{ dateutil.format(props.details.purchasedDate, "MMM DD, YYYY") }</td>
                <td>{ props.details.billname }</td>
                <td>{ formatAmount(props.details.amount) }</td>
                <td>{ props.details.categoryName || "-" }</td>
                <td> <VerifyIndicator
                    id={ "xpns-verify-" + props.id }
                    key={ "xpns-verify-" + props.id }
                    disabled={ true }
                    className="is-smaller"
                    verifiedDateTime={ props.details.verifiedDateTime }
                /> </td>
                <td> <span title={ props.details.tags }> { getShortForm(props.details.tags) || "-" } </span>  </td>
                <td> <span title={ props.details.description } > { getShortForm(props.details.description) || "-" } </span>  </td>
                <td>
                    { actions.map(ae => ae) }
                    { !actions.length && "-" }
                </td>
            </tr>
            {
                !!props.details.expenseItems && !!props.details.expenseItems.length &&
                <>
                    {
                        props.details.expenseItems.map(item =>
                            <tr className={ `${showBreakdown ? "" : "is-hidden"} is-light ${props.isSelected ? "is-selected" : ""}` } key={ item.id + "breakdownrow" }>
                                <td colSpan={ 2 }> &nbsp; </td>
                                <td> { item.billname } </td>
                                <td> { formatAmount(item.amount) } </td>
                                <td> { item.categoryName || "-" } </td>
                                <td> &nbsp; </td>
                                <td> { getShortForm(item.tags) || "-" } </td>
                                <td colSpan={ 2 }> { getShortForm(item.description) || "-" } </td>
                            </tr>
                        )
                    }
                </>

            }
        </>
    );
};

export default ExpenseItemTableRow;