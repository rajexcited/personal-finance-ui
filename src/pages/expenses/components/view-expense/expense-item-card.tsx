import { faAngleUp, faAngleDown, faEdit, faTrash, faReceipt, faCircleDollarToSlot, faShoppingCart, faExchangeAlt, faArrowCircleUp, faDollarSign, faUndo, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFullPath } from "../../../root";
import { Animated, VerifyIndicator } from "../../../../components";
import { useAuth } from "../../../auth";
import { ExpenseBelongsTo, ExpenseFields, formatTimestamp, getLogger } from "../../services";
import { getExpenseDateInstance } from "../../services/expense";
import { getDateInstance, getShortForm } from "../../../../shared";
import { createSharePersonTagSourceMap } from "../common";
import { SharePersonResource } from "../../../settings/services";


interface ExpenseItemCardProps {
    id: string;
    details: ExpenseFields;
    onSelect (expenseId: string, belongsTo: ExpenseBelongsTo): void;
    isSelected: Boolean;
    onRemove (expense: ExpenseFields): void;
    onViewReceipt (expense: ExpenseFields): void;
    onRenderCompleted (expenseId: string): void;
    sharePersons: SharePersonResource[];
    startRendering: boolean;
}

const fcLogger = getLogger("FC.expense.view.ExpenseItemCard", null, null, "DISABLED");

export const ExpenseItemCard: FunctionComponent<ExpenseItemCardProps> = props => {
    const [isBodyOpen, setBodyOpen] = useState(false);
    const [expenseDate, setExpenseDate] = useState<string>();
    const navigate = useNavigate();
    const auth = useAuth();
    const sharePersonMap = useMemo(() => {
        return createSharePersonTagSourceMap(props.sharePersons);
    }, [props.sharePersons]);

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

    const onClickBodyToggleHandler: React.MouseEventHandler<HTMLButtonElement | HTMLSpanElement> = event => {
        event.preventDefault();
        setBodyOpen((oldstate) => !oldstate);
    };

    const onClickTrashExpenseHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onRemove(props.details);
    };

    const onClickEditExpenseHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
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

    const onClickShowReceiptsHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        props.onViewReceipt(props.details);
    };

    const onClickAddRefundHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
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
    let belongsToIconTip = <span></span>;
    let verifiedDate = "";

    if (props.details.belongsTo === ExpenseBelongsTo.Income) {
        belongsTo = "Income";
        expenseCategory = props.details.incomeTypeName;
        belongsToIconTip = <span className="icon has-text-info tooltip is-tooltip-multiline is-tooltip-top" data-tooltip={ belongsTo }> <FontAwesomeIcon icon={ faDollarSign } /> </span>;
    } else if (props.details.belongsTo === ExpenseBelongsTo.Purchase) {
        belongsTo = "Purchase";
        expenseCategory = props.details.purchaseTypeName;
        belongsToIconTip = <span className="icon has-text-info tooltip is-tooltip-multiline is-tooltip-top" data-tooltip={ belongsTo }> <FontAwesomeIcon icon={ faShoppingCart } /> </span>;
        verifiedDate = "-";
        if (props.details.verifiedTimestamp) {
            const verifiedDateInstance = getDateInstance(props.details.verifiedTimestamp);
            if (verifiedDateInstance) {
                verifiedDate = formatTimestamp(verifiedDateInstance, "MMM DD, YYYY");
            }
        }
        fcLogger.debug("purchase, verifiedDate=", verifiedDate, "billname=", props.details.billName, "id=", props.details.id);
    } else if (props.details.belongsTo === ExpenseBelongsTo.PurchaseRefund) {
        belongsTo = "Refund";
        expenseCategory = props.details.reasonValue;
        belongsToIconTip = <span className="icon has-text-info tooltip is-tooltip-multiline is-tooltip-top" data-tooltip={ belongsTo }> <FontAwesomeIcon icon={ faUndo } /> </span>;
    }

    const updateExpenseAction =
        (<button className="button is-link is-active" onClick={ onClickEditExpenseHandler } key={ "updt-purchase-action" + props.id }>
            <span className="icon tooltip" data-tooltip={ "Update " + belongsTo }>
                <FontAwesomeIcon icon={ faEdit } />
            </span>
        </button>);

    const removeExpenseAction = (<button className="button is-link is-active" onClick={ onClickTrashExpenseHandler } key={ "rmve-purchase-action" + props.id }>
        <span className="icon tooltip" data-tooltip={ "Remove " + belongsTo }>
            <FontAwesomeIcon icon={ faTrash } />
        </span>
    </button>);

    const viewReceiptsAction = (
        <button className="button is-link is-active" onClick={ onClickShowReceiptsHandler } key={ "view-receipts-action" + props.id }>
            <span className="icon tooltip" data-tooltip="View Receipts">
                <FontAwesomeIcon icon={ faReceipt } />
            </span>
        </button>
    );

    const addRefundAction = (
        <button className="button is-link is-active" onClick={ onClickAddRefundHandler } key={ "add-refund-action" + props.id }>
            <span className="icon tooltip" data-tooltip="Add Refund">
                <FontAwesomeIcon icon={ faCircleDollarToSlot } />
            </span>
        </button>
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
        <section className="container mb-4">
            <div className="card">
                <header className="card-header">
                    <div className="card-header-title">
                        <div className="card-header-icon" onClick={ onClickBodyToggleHandler }>
                            <div className="columns">
                                <div className="column">
                                    <nav className="level">
                                        <div className="level-item">
                                            { belongsToIconTip }
                                            <span>{ getShortForm(props.details.billName, 18, "-") }</span>
                                        </div>
                                        <div className="level-item">
                                            { expenseDate }
                                            { verifiedDate.length > 0 &&
                                                <VerifyIndicator
                                                    id={ "purchase-verify-indicator-title" + props.details.id }
                                                    verifiedDateTime={ verifiedDate }
                                                    verifiedDateFormat="MMM DD, YYYY"
                                                    disabled={ true }
                                                    className="is-smaller"
                                                />
                                            }
                                        </div>
                                    </nav>
                                </div>
                                <div className="column">
                                    <div className="buttons">
                                        {
                                            actions.map(ae => ae)
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="card-header-icon" aria-label="expand breakdown" onClick={ onClickBodyToggleHandler }>
                        <span className="icon is-large">
                            <FontAwesomeIcon icon={ isBodyOpen ? faAngleUp : faAngleDown } />
                        </span>
                    </button>
                </header>
                <Animated animateOnMount={ false } isPlayIn={ isBodyOpen } animatedIn="fadeIn" animatedOut="fadeOut" isVisibleAfterAnimateOut={ false } >
                    <div className="card-content is-active">
                        <div className="content">
                            <div className="columns is-variable">
                                <div className="column">
                                    <label className="label">ExpenseBelongsTo: </label>
                                    <span>{ belongsTo }</span>
                                </div>
                                <div className="column">
                                    <label className="label">BillName: </label>
                                    <span>{ props.details.billName }</span>
                                </div>
                            </div>
                            <div className="columns is-variable">
                                <div className="column">
                                    <label className="label">Expense Category: </label>
                                    <span>{ expenseCategory }</span>
                                </div>
                                <div className="column">
                                    <label className="label">Payment Account: </label>
                                    <span>{ props.details.paymentAccountName || "-" }</span>
                                </div>
                                {
                                    verifiedDate.length > 1 &&
                                    <div className="column">
                                        <label className="label">Verified Date: </label>
                                        <div className="level is-mobile">
                                            <span className="level-item is-narrow">{ verifiedDate }</span>
                                            <span className="level-item">
                                                <VerifyIndicator
                                                    id={ "purchase-verify-indicator-body" + props.details.id }
                                                    verifiedDateTime={ verifiedDate }
                                                    verifiedDateFormat="MMM DD, YYYY"
                                                    disabled={ true }
                                                    className="is-smaller"
                                                />
                                            </span>
                                        </div>
                                    </div>
                                }
                                {
                                    verifiedDate.length === 1 &&
                                    <div className="column">
                                        <div className="level is-mobile">
                                            <span className="level-item is-narrow">{ belongsTo } un-verified</span>
                                            <span className="level-item">
                                                <VerifyIndicator
                                                    id={ "purchase-verify-indicator-body" + props.details.id }
                                                    verifiedDateTime={ verifiedDate }
                                                    verifiedDateFormat="MMM DD, YYYY"
                                                    disabled={ true }
                                                    className="is-smaller"
                                                />
                                            </span>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="columns is-variable">
                                <div className="column">
                                    <label className="label">Tags: </label>
                                    <div className="tags">
                                        {
                                            props.details.tags.map(tag =>
                                                <span
                                                    className="tag is-link"
                                                    key={ tag + "-tag-key" }
                                                >
                                                    { tag }
                                                </span>
                                            )
                                        }
                                        {
                                            props.details.tags.length === 0 &&
                                            <span>-</span>
                                        }
                                    </div>
                                </div>
                                <div className="column">
                                    <label className="label">Tags: </label>
                                    <div className="tags">
                                        {
                                            props.details.personIds.map(pid =>
                                                <span
                                                    className="tag is-link"
                                                    key={ pid + "-tag-key" }
                                                >
                                                    { sharePersonMap[pid].displayText }
                                                </span>
                                            )
                                        }
                                        {
                                            props.details.personIds.length === 0 &&
                                            <span>-</span>
                                        }
                                    </div>
                                </div>
                                <div className="column">
                                    <label className="label">Description: </label>
                                    <span>{ props.details.description }</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer className="card-footer is-active"> </footer>
                </Animated>
            </div>

        </section>
    );
};

