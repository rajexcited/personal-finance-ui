import { FunctionComponent, useRef } from "react";
import { faEdit, faTrash, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VerifyIndicator } from "../../../../components";
import { getLogger, PurchaseFields } from "../../services";
import dateutil from "date-and-time";
import { formatAmount } from "../../../../formatters";


interface ExpenseItemTableRowProps {
    id: string;
    details: PurchaseFields;
    onSelect (expenseId: string): void;
    isSelected: Boolean;
    onRemove (expenseId: string): void;
    onEditRequest (expenseId: string): void;
    onViewReceipt (expenseId: string): void;
}

const fcLogger = getLogger("FC.expenseItemTableRow");

export const ExpenseItemTableRow: FunctionComponent<ExpenseItemTableRowProps> = (props) => {
    const rowRef = useRef<HTMLTableRowElement>(null);


    const onClickToggleRowSelectionHandler: React.MouseEventHandler<HTMLTableRowElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        if (props.isSelected) props.onSelect("");
        else props.onSelect(props.details.id);
    };

    const onClickTrashExpenseHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onRemove(props.details.id);
    };

    const onClickonEditStartExpenseHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onEditRequest(props.details.id);
    };

    const onClickShowReceiptsHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onViewReceipt(props.details.id);
    };

    const getShortForm = (text?: string | string[]) => {
        if (Array.isArray(text)) {
            text = text.join();
        }
        return text && text.length > 15 ? text.substring(0, 12).concat("...") : text;
    };

    const updateExpenseAction = (<a className="is-link" onClick={ onClickonEditStartExpenseHandler } key={ "updt-purchase-action" + props.id }>
        <span className="icon tooltip" data-tooltip="Update Expense">
            <FontAwesomeIcon icon={ faEdit } />
        </span>
    </a>);

    const removeExpenseAction = (<a className="is-link" onClick={ onClickTrashExpenseHandler } key={ "rmve-purchase-action" + props.id }>
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

    return (
        <>
            <tr ref={ rowRef } onClick={ onClickToggleRowSelectionHandler } className={ props.isSelected ? "is-selected" : "" }>
                <td>{ props.details.paymentAccountName || "-" }</td>
                <td>{ dateutil.format(props.details.purchasedDate as Date, "MMM DD, YYYY") }</td>
                <td>{ props.details.billName }</td>
                <td>{ formatAmount(props.details.amount) }</td>
                <td>{ props.details.paymentAccountName || "-" }</td>
                <td> <VerifyIndicator
                    id={ "purchase-verify-" + props.id }
                    key={ "purchase-verify-" + props.id }
                    disabled={ true }
                    className="is-smaller"
                    verifiedDateTime={ props.details.verifiedTimestamp as Date }
                /> </td>
                <td> <span title={ props.details.tags.join() }> { getShortForm(props.details.tags) || "-" } </span>  </td>
                <td>
                    { actions.map(ae => ae) }
                    { !actions.length && "-" }
                </td>
            </tr>
        </>
    );
};

