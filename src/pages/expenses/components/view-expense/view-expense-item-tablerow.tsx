import { FunctionComponent, useState, useRef } from "react";
import { faSquarePlus, faSquareMinus, faEdit, faTrash, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VerifyIndicator } from "../../../../components";
import { CategoryService, ExpenseFields } from "../../services";
import dateutil from "date-and-time";
import { formatAmount } from "../../../../formatters";


const categoryService = CategoryService();

interface ExpenseItemTableRowProps {
    id: string;
    details: ExpenseFields;
    onSelect (expenseId: string): void;
    isSelected: Boolean;
    onRemove (expenseId: string): void;
    onEditRequest (expenseId: string): void;
    onViewReceipt (expenseId: string): void;
}

const ExpenseItemTableRow: FunctionComponent<ExpenseItemTableRowProps> = (props) => {
    const [showBreakdown, setShowBreakdown] = useState(false);
    const rowRef = useRef<HTMLTableRowElement>(null);

    const onClickToggleBreakdownRowsHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        setShowBreakdown(prev => !prev);
    };

    const onClickToggleRowSelectionHandler: React.MouseEventHandler<HTMLTableRowElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        if (props.isSelected) props.onSelect("");
        else props.onSelect(props.details.expenseId);
    };

    const onClickTrashExpenseHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onRemove(props.details.expenseId);
    };

    const onClickonEditStartExpenseHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onEditRequest(props.details.expenseId);
    };

    const onClickShowReceiptsHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onViewReceipt(props.details.expenseId);
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

    let itemBreakdownAction;
    if (showBreakdown) {
        itemBreakdownAction = (<a className="is-link" onClick={ onClickToggleBreakdownRowsHandler } key={ "item-breakdown-action" + props.id }>
            <span className="icon tooltip" data-tooltip="Hide Breakdown">
                <FontAwesomeIcon icon={ faSquareMinus } />
            </span>
        </a>);
    } else {
        itemBreakdownAction = (<a className="is-link" onClick={ onClickToggleBreakdownRowsHandler } key={ "item-breakdown-action" + props.id }>
            <span className="icon tooltip" data-tooltip="Show Breakdown">
                <FontAwesomeIcon icon={ faSquarePlus } />
            </span>
        </a>);
    }

    const updateExpenseAction = (<a className="is-link" onClick={ onClickonEditStartExpenseHandler } key={ "updt-xpns-action" + props.id }>
        <span className="icon tooltip" data-tooltip="Update Expense">
            <FontAwesomeIcon icon={ faEdit } />
        </span>
    </a>);

    const removeExpenseAction = (<a className="is-link" onClick={ onClickTrashExpenseHandler } key={ "rmve-xpns-action" + props.id }>
        <span className="icon tooltip" data-tooltip="Remove Expense">
            <FontAwesomeIcon icon={ faTrash } />
        </span>
    </a>);

    const viewReceiptsAction = (
        <a className="is-link" onClick={ onClickShowReceiptsHandler } key={ "view-receipts-action" + props.id }>
            <span className="icon tooltip" data-tooltip="View Receipts">
                <FontAwesomeIcon icon={ faReceipt } />
            </span>
        </a>
    );

    const actions = [updateExpenseAction, removeExpenseAction];
    if (!!props.details.receipts.length) {
        actions.push(viewReceiptsAction);
    }
    if (!!props.details.expenseItems.length) {
        actions.push(itemBreakdownAction);
    }

    return (
        <>
            <tr ref={ rowRef } onClick={ onClickToggleRowSelectionHandler } className={ props.isSelected ? "is-selected" : "" }>
                <td>{ props.details.pymtaccName || "-" }</td>
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
                props.details.expenseItems.map(item =>
                    <tr className={ `${showBreakdown ? "" : "is-hidden"} is-light ${props.isSelected ? "is-selected" : ""}` } key={ item.expenseId + "breakdownrow" }>
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
    );
};

export default ExpenseItemTableRow;
