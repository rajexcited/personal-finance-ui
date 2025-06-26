import React, { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Animated, ConfirmDialog, LoadSpinner } from "../../../../components";
import { getLogger, RouteHandlerResponse, ExpenseFields } from "../../services";
import { getFullPath } from "../../../root";
import { useOrientation, DeviceMode } from "../../../../hooks";
import { ViewReceipts } from "./receipt/view-receipts";
import { ReceiptProps } from "../../../../components/receipt";
import { SelectedExpense } from "./common";
import { ExpenseListTable } from "./expense-list-table";
import { ExpenseListCards } from "./expense-list-cards";
import { SharePersonResource } from "../../../settings/services";
import { ExpenseListLoaderResource } from "../../route-handlers";
import { sleep, testAttributes } from "../../../../shared";

enum ExpenseListOperation {
    Merge = "merge",
    Replace = "replace"
}

const fcLogger = getLogger("FC.expense.view.ExpenseList", null, null, "DISABLED");

export const ExpenseList: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<ExpenseListLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [expenseList, setExpenseList] = useState<ExpenseFields[]>([]);
    const [sharePersons, setSharePersons] = useState<SharePersonResource[]>([]);
    const [deletingExpense, setDeletingExpense] = useState<SelectedExpense>();
    const [expenseReceipts, setExpenseReceipts] = useState<ReceiptProps[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loadingExpenses, setLoadingExpenses] = useState(true);
    const { resultedDevice: deviceMode } = useOrientation(DeviceMode.Mobile);
    const [listOperation, setListOperation] = useState(ExpenseListOperation.Replace);

    const submit = useSubmit();

    /**
     * do I need this useeffect? can i not set loader data directly to expenseList state?
     * No, I can't. 
     *  loaderdata and actiondata once initialized with value, they are not changing, which is useful for us.
     * but when user wishes to load more expenses, the new requests replaces loaderdata with new incoming data.
     * which may cause data loss on currectly viewable page.
     * useEffect is only getting called if any updates on loaderdata or actiondata
     * by splitting useEffect on each loaderdata and actiondata tells us 
     *      when we received what event, useful in taking appropriate actions
     **/
    useEffect(() => {
        const logger = getLogger("useEffect.dep[loaderData]", fcLogger);
        logger.debug("loaderdata.type=", loaderData.type, "loaderdata.data=", loaderData.data);
        if (loaderData.type === "success") {
            setErrorMessage("");

            setExpenseList(prev => {
                if (listOperation === ExpenseListOperation.Merge) {
                    logger.debug("merging new list with old expense list");
                    return [...loaderData.data.expenseList, ...prev];
                }
                logger.debug("replacing new list");
                return [...loaderData.data.expenseList];
            });
            setSharePersons(prev => [...loaderData.data.sharePersons]);

        } else {
            setErrorMessage(loaderData.errorMessage);
        }
    }, [loaderData]);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[actionData]", fcLogger);
        logger.debug("actiondata.type=", actionData?.type, "actiondata.data=", actionData?.data);
        if (actionData?.type === "success") {
            setErrorMessage("");
        } else if (actionData) {
            setErrorMessage(actionData.errorMessage);
        }
    }, [actionData]);

    const onRemoveRequestHandler = (removingExpense: ExpenseFields) => {
        setDeletingExpense(prev => {
            if (removingExpense.id === prev?.id && removingExpense.belongsTo === prev.belongsTo) {
                return prev;
            }
            return { ...removingExpense };
        });
    };

    const onViewReceiptsRequestHandler = (selectedExpense: ExpenseFields) => {
        const logger = getLogger("onViewReceiptsRequestHandler", fcLogger);
        // const foundExpense = expenseList.find(xpns => xpns.id === selectedExpense.id && xpns.belongsTo === selectedExpense.belongsTo);
        // if (foundExpense?.receipts) {
        // setExpenseReceipts(foundExpense.receipts);
        // }

        logger.debug("setting receipts to open view model. receipts.length=", selectedExpense.receipts.length, "receipts=", selectedExpense.receipts);
        setExpenseReceipts(selectedExpense.receipts);
    };

    const onDeleteConfirmHandler = () => {
        const data: any = { ...deletingExpense };
        submit(data, { action: getFullPath("expenseJournalRoot") + "?index", method: "delete" });
        setDeletingExpense(undefined);
        setErrorMessage("");
        setLoadingExpenses(true);
        setListOperation(ExpenseListOperation.Replace);
    };

    const expenseListRenderCompletedHandler = () => {
        const logger = getLogger("expenseListRenderCompletedHandler", fcLogger);
        setLoadingExpenses(false);
        logger.debug("expense list child component loaded. setting loading indicator to false");
    };
    const expenseListRenderStartedHandler = () => {
        const logger = getLogger("expenseListRenderStartedHandler", fcLogger);
        setLoadingExpenses(true);
        logger.debug("expense list child component reloading. setting loading indicator to true");
    };

    const onClickLoadMoreHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        setListOperation(ExpenseListOperation.Merge);
        // request expenses for more months from router
        submit({ loadMore: "months" }, { action: getFullPath("expenseJournalRoot") + "?index", method: "post" });
    };
    fcLogger.debug("view expense list", [...expenseList], "list of billname", expenseList.map(xpns => xpns.billName), "errorMessage =", errorMessage, "receipts=", expenseReceipts);

    return (
        <section { ...testAttributes("expense-list-view") }>
            <LoadSpinner loading={ loadingExpenses } id="view-expense-list" />

            <Animated animateOnMount={ false } isPlayIn={ !!errorMessage } animatedIn="fadeInDown" animatedOut="fadeOutUp" isVisibleAfterAnimateOut={ false } scrollBeforePlayIn={ true }>
                <div className="columns is-centered" { ...testAttributes("expense-list-error-message") }>
                    <div className="column is-four-fifths">
                        <article className="message is-danger mb-3">
                            <div className="message-body">
                                <ReactMarkdown children={ errorMessage } />
                            </div>
                        </article>
                    </div>
                </div>
            </Animated>

            {
                deviceMode === DeviceMode.Desktop &&
                <ExpenseListTable
                    expenseList={ expenseList }
                    onRemove={ onRemoveRequestHandler }
                    onViewReceipts={ onViewReceiptsRequestHandler }
                    onRenderCompleted={ expenseListRenderCompletedHandler }
                    onRenderStart={ expenseListRenderStartedHandler }
                />
            }
            {
                deviceMode === DeviceMode.Mobile &&
                <ExpenseListCards
                    expenseList={ expenseList }
                    onRemove={ onRemoveRequestHandler }
                    onViewReceipts={ onViewReceiptsRequestHandler }
                    onRenderCompleted={ expenseListRenderCompletedHandler }
                    onRenderStart={ expenseListRenderStartedHandler }
                    sharePersons={ sharePersons }
                />
            }
            {
                !expenseList.length &&
                <p className="subtitle">There are no expenses</p>
            }
            {
                !!expenseList.length &&
                <div className="buttons is-centered">
                    <button className="button is-large is-focused" disabled={ loaderData.data?.expenseList.length === 0 || loadingExpenses } onClick={ onClickLoadMoreHandler } >Load More</button>
                </div>
            }

            <ConfirmDialog
                id="delete-expense-confirm-dialog"
                content={ "Do you really want to delete expense " + deletingExpense?.belongsTo + "?" }
                title={ "Remove " + deletingExpense?.belongsTo }
                open={ !!deletingExpense?.id }
                onConfirm={ onDeleteConfirmHandler }
                onCancel={ () => setDeletingExpense(undefined) }
                yesButtonClassname="is-danger"
            />
            <ViewReceipts
                key={ "view-receipts-" + ((expenseReceipts.length > 0 && expenseReceipts[0].relationId) || "dummy") }
                isShow={ expenseReceipts.length > 0 }
                receipts={ expenseReceipts }
                onHide={ () => setExpenseReceipts([]) }
            />
        </section>
    );
};

