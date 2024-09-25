import { FunctionComponent, useEffect, useRef, useState } from "react";
import { faEdit, faTrash, faReceipt, faCircleDollarToSlot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ExpenseBelongsTo, ExpenseFields, formatTimestamp, getLogger } from "../../services";
import { formatAmount } from "../../../../formatters";
import { useNavigate } from "react-router-dom";
import { getFullPath } from "../../../root";
import { parseTimestamp } from "../../../../shared";
import { useAuth } from "../../../auth";


interface ExpenseItemTableRowProps {
    id: string;
    details: ExpenseFields;
    onSelect (expenseId: string, belongsTo: ExpenseBelongsTo): void;
    isSelected: Boolean;
    onRemove (expenseId: string, belongsTo: ExpenseBelongsTo): void;
    onViewReceipt (expenseId: string, belongsTo: ExpenseBelongsTo): void;
}

const fcLogger = getLogger("FC.expenseItemTableRow");

export const ExpenseItemTableRow: FunctionComponent<ExpenseItemTableRowProps> = (props) => {
    const [expenseDate, setExpenseDate] = useState<string>();
    const rowRef = useRef<HTMLTableRowElement>(null);
    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        let xpnsDateStr = undefined;
        if (props.details.belongsTo === ExpenseBelongsTo.Income) {
            xpnsDateStr = props.details.incomeDate;
        } else if (props.details.belongsTo === ExpenseBelongsTo.Purchase) {
            xpnsDateStr = props.details.purchasedDate;
        } else if (props.details.belongsTo === ExpenseBelongsTo.PurchaseRefund) {
            xpnsDateStr = props.details.refundDate;
        }

        let xpnsDate = undefined;
        if (xpnsDateStr instanceof Date) {
            xpnsDate = xpnsDateStr;
        } else if (typeof xpnsDateStr === "string") {
            xpnsDate = parseTimestamp(xpnsDateStr);
        }
        if (xpnsDate) {
            setExpenseDate(formatTimestamp(xpnsDate, "MMM DD, YYYY"));
        }
    }, []);

    const onClickToggleRowSelectionHandler: React.MouseEventHandler<HTMLTableRowElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        if (props.isSelected) props.onSelect("", props.details.belongsTo);
        else props.onSelect(props.details.id, props.details.belongsTo);
    };

    const onClickTrashExpenseHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onRemove(props.details.id, props.details.belongsTo);
    };

    // const onClickViewExpenseHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
    //     event.preventDefault();
    //     event.stopPropagation();
    //     if(props.details.belongsTo === ExpenseBelongsTo.Purchase) {
    //         navigate(getFullPath("viewPurchase", props.details.id));
    //     }
    // };

    const onClickEditExpenseHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        if (props.details.belongsTo === ExpenseBelongsTo.Purchase) {
            navigate(getFullPath("updatePurchase", props.details.id));
        } else if (props.details.belongsTo === ExpenseBelongsTo.PurchaseRefund) {
            navigate(getFullPath("updatePurchaseRefund", props.details.id));
        } else if (props.details.belongsTo === ExpenseBelongsTo.Income) {
            navigate(getFullPath("updateIncome", props.details.id));
        }
    };

    const onClickShowReceiptsHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onViewReceipt(props.details.id, props.details.belongsTo);
    };

    const onClickAddRefundHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        const logger = getLogger("onClickAddRefundHandler", fcLogger);
        event.preventDefault();
        event.stopPropagation();
        if (props.details.belongsTo === ExpenseBelongsTo.Purchase) {
            navigate(getFullPath("addPurchase", props.details.id));
        } else {
            logger.warn("cannot add refund for expense - " + props.details.belongsTo);
        }
    };

    const getShortForm = (text?: string | string[]) => {
        if (Array.isArray(text)) {
            text = text.join();
        }
        return text && text.length > 15 ? text.substring(0, 12).concat("...") : text;
    };

    let belongsTo = "NA";
    let expenseCategory = undefined;

    if (props.details.belongsTo === ExpenseBelongsTo.Income) {
        belongsTo = "Income";
        expenseCategory = props.details.incomeTypeName;
    } else if (props.details.belongsTo === ExpenseBelongsTo.Purchase) {
        belongsTo = "Purchase";
        expenseCategory = props.details.purchaseTypeName;
    } else if (props.details.belongsTo === ExpenseBelongsTo.PurchaseRefund) {
        belongsTo = "Refund";
        expenseCategory = props.details.reasonValue;
    }


    // const viewExpenseAction = (<a className="is-link" onClick={ onClickViewExpenseHandler } key={ "updt-purchase-action" + props.id }>
    //     <span className="icon tooltip" data-tooltip="Update Expense">
    //         <FontAwesomeIcon icon={ faFileInvoiceDollar } />
    //     </span>
    // </a>);

    const updateExpenseAction = (<a className="is-link" onClick={ onClickEditExpenseHandler } key={ "updt-purchase-action" + props.id }>
        <span className="icon tooltip" data-tooltip={ "Update " + belongsTo }>
            <FontAwesomeIcon icon={ faEdit } />
        </span>
    </a>);

    const removeExpenseAction = (<a className="is-link" onClick={ onClickTrashExpenseHandler } key={ "rmve-purchase-action" + props.id }>
        <span className="icon tooltip" data-tooltip={ "Remove " + belongsTo }>
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

    const addRefundAction = (
        <a className="is-link" onClick={ onClickAddRefundHandler } key={ "add-refund-action" + props.id }>
            <span className="icon tooltip" data-tooltip="Add Refund">
                <FontAwesomeIcon icon={ faCircleDollarToSlot } />
            </span>
        </a>
    );

    const actions = [];
    if (!auth.readOnly) {
        actions.push(updateExpenseAction, removeExpenseAction);
    }
    if (props.details.belongsTo === ExpenseBelongsTo.Purchase && !auth.readOnly) {
        actions.push(addRefundAction);
    }
    if (props.details.receipts.length > 0) {
        actions.push(viewReceiptsAction);
    }




    return (
        <>
            <tr ref={ rowRef } onClick={ onClickToggleRowSelectionHandler } className={ props.isSelected ? "is-selected" : "" }>
                <td>{ belongsTo }</td>
                { <td>{ expenseDate || "-" }</td> }
                <td>{ props.details.paymentAccountName || "-" }</td>
                <td>{ props.details.billName }</td>
                <td>{ formatAmount(props.details.amount) }</td>
                <td>{ expenseCategory || "-" }</td>
                {/* <td> <VerifyIndicator
                    id={ "purchase-verify-" + props.id }
                    key={ "purchase-verify-" + props.id }
                    disabled={ true }
                    className="is-smaller"
                    verifiedDateTime={ props.details.verifiedTimestamp as Date }
                /> </td> */}
                <td> <span title={ props.details.tags.join() }> { getShortForm(props.details.tags) || "-" } </span>  </td>
                <td>
                    { actions.map(ae => ae) }
                    { actions.length === 0 && "-" }
                </td>
            </tr>
        </>
    );
};

