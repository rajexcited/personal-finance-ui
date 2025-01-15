import { FunctionComponent, useEffect, useRef, useState } from "react";
import { faEdit, faTrash, faReceipt, faCircleDollarToSlot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ExpenseBelongsTo, ExpenseFields, formatTimestamp, getLogger } from "../../services";
import { formatAmount } from "../../../../formatters";
import { useNavigate } from "react-router-dom";
import { getFullPath } from "../../../root";
import { useAuth } from "../../../auth";
import { getExpenseDateInstance } from "../../services/expense";
import { getShortForm } from "../../../../shared";
import { Anchor } from "../../../../components";


interface ExpenseItemTableRowProps {
    id: string;
    details: ExpenseFields;
    onSelect (expenseId: string, belongsTo: ExpenseBelongsTo): void;
    isSelected: Boolean;
    onRemove (expense: ExpenseFields): void;
    onViewReceipt (expense: ExpenseFields): void;
    onRenderCompleted (expenseId: string): void;
    startRendering: boolean;
}

const fcLogger = getLogger("FC.expense.view.expenseItemTableRow", null, null, "DISABLED");

export const ExpenseItemTableRow: FunctionComponent<ExpenseItemTableRowProps> = (props) => {
    const [expenseDate, setExpenseDate] = useState<string>();
    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);
        const xpnsDate = getExpenseDateInstance(props.details, logger);
        logger.debug("converting expense date to date instance and setting formatted value. also triggering render complete event");
        if (xpnsDate) {
            setExpenseDate(formatTimestamp(xpnsDate, "MMM DD, YYYY"));
        }
    }, []);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[props.startRendering]", fcLogger);
        logger.debug("start rendering flag? ", props.startRendering, "this called after no dep useEffect handler");
        if (props.startRendering) {
            props.onRenderCompleted(props.details.id);
        }
    }, [props.startRendering]);

    const onClickToggleRowSelectionHandler: React.MouseEventHandler<HTMLTableRowElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        if (props.isSelected) props.onSelect("", props.details.belongsTo);
        else props.onSelect(props.details.id, props.details.belongsTo);
    };

    const onClickTrashExpenseHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onRemove(props.details);
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
        props.onViewReceipt(props.details);
    };

    const onClickAddRefundHandler: React.MouseEventHandler<HTMLAnchorElement> = event => {
        const logger = getLogger("onClickAddRefundHandler", fcLogger);
        event.preventDefault();
        event.stopPropagation();
        if (props.details.belongsTo === ExpenseBelongsTo.Purchase) {
            navigate(getFullPath("addPurchaseRefund", props.details.id));
        } else {
            logger.warn("cannot add refund for expense - " + props.details.belongsTo);
        }
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

    const updateExpenseAction = (<Anchor className="is-link" onClick={ onClickEditExpenseHandler } key={ "updt-purchase-action" + props.id }>
        <span className="icon tooltip" data-tooltip={ "Update " + belongsTo }>
            <FontAwesomeIcon icon={ faEdit } />
        </span>
    </Anchor>);

    const removeExpenseAction = (<Anchor className="is-link" onClick={ onClickTrashExpenseHandler } key={ "rmve-purchase-action" + props.id }>
        <span className="icon tooltip" data-tooltip={ "Remove " + belongsTo }>
            <FontAwesomeIcon icon={ faTrash } />
        </span>
    </Anchor>);

    const viewReceiptsAction = (
        <Anchor className="is-link" onClick={ onClickShowReceiptsHandler } key={ "view-receipts-action" + props.id }>
            <span className="icon tooltip" data-tooltip="View Receipts">
                <FontAwesomeIcon icon={ faReceipt } />
            </span>
        </Anchor>
    );

    const addRefundAction = (
        <Anchor className="is-link" onClick={ onClickAddRefundHandler } key={ "add-refund-action" + props.id }>
            <span className="icon tooltip" data-tooltip="Add Refund">
                <FontAwesomeIcon icon={ faCircleDollarToSlot } />
            </span>
        </Anchor>
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

    fcLogger.debug("render updates");

    return (
        <tr onClick={ onClickToggleRowSelectionHandler } className={ props.isSelected ? "is-selected" : "" }>
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
            <td> <span title={ props.details.tags.join() }> { getShortForm(props.details.tags, 15, "-") } </span>  </td>
            <td>
                { actions.map(ae => ae) }
                { actions.length === 0 && "-" }
            </td>
        </tr>
    );
};

