import { FunctionComponent, useMemo, useState } from "react";
import { Animated, ConfirmDialog, List, Switch } from "../../../components";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import { ConfigResource, ConfigTypeBelongsTo, ConfigTypeStatus, DeleteConfigDetailsResource, RouteHandlerResponse, UpdateConfigDetailsResource, UpdateConfigStatusResource, getLogger } from "../../../services";
import { Control, ListItem } from "../../../components/list";
import { ActionId, TypeCategoryAction } from "../services";
import ViewConfig from "./view-config";
import UpdateConfig, { ConfigInputProps } from "./update-config";
import { faEdit, faEye, faRemove, faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { getFullPath } from "../../root";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import { ExpenseCategoryTypeLoaderResource } from "../route-handlers/expense-category-loader-action";


const fcLogger = getLogger("FC.settings.ExpenseCategoryPage", null, null, "DEBUG");

const ExpenseCategoryPage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<ExpenseCategoryTypeLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [enableFilter, setEnableFilter] = useState(true);
    const [action, setAction] = useState<TypeCategoryAction>();
    const [toggleUpdate, setToggleUpdate] = useState(false);
    const submit = useSubmit();

    const expenseCategoryItems: ListItem[] = useMemo(() => {
        if (loaderData.type === "success") {
            const list = loaderData.data.categoryTypes.map(cfg => ({
                id: cfg.id,
                title: cfg.name + " - " + cfg.status,
                description: cfg.description,
                status: cfg.status === ConfigTypeStatus.Enable
            }));
            if (enableFilter) {
                return list.filter(item => item.status);
            }
            return list;
        }
        return [];
    }, [loaderData, enableFilter]);

    const onClickRequestAddExpenseCategoryHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        const defaultAddConfig: ConfigResource = {
            belongsTo: ConfigTypeBelongsTo.ExpenseCategory,
            id: uuidv4(),
            description: "",
            name: "",
            value: "",
            status: ConfigTypeStatus.Enable,
            auditDetails: { createdOn: "", updatedOn: "" },
            tags: []
        };
        setAction({ item: defaultAddConfig, type: ActionId.Add });
    };
    const onClickRequestUpdateExpenseCategoryHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) {
            setAction({ item: action.item, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        }
    };
    const onClickRequestDeleteExpenseCategoryHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) setAction({ item: action.item, type: ActionId.Delete });
    };

    const onRequestListControlExpenseCategoryHandler = (item: ListItem, control: Control) => {
        const cfgitem = loaderData.type === "success" && loaderData.data.categoryTypes.find(cfg => cfg.id === item.id);
        if (!cfgitem) return;

        if (control.id === ActionId.View) {
            setAction({ item: cfgitem, type: ActionId.View });
        } else if (control.id === ActionId.Update) {
            setAction({ item: cfgitem, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        } else if (control.id === ActionId.Delete) {
            setAction({ item: cfgitem, type: ActionId.Delete });
        } else if (control.id === ActionId.ToggleEnable) {
            onAddUpdateExpenseCategoryHandler({
                ...cfgitem,
                status: ConfigTypeStatus.Enable,
                action: "updateStatus"
            });
        } else if (control.id === ActionId.ToggleDisable) {
            onAddUpdateExpenseCategoryHandler({
                ...cfgitem,
                status: ConfigTypeStatus.Disable,
                action: "updateStatus"
            });
        }
    };

    const onDeleteConfirmHandler = () => {
        if (action?.item) {
            const data: DeleteConfigDetailsResource = {
                ...action.item,
                action: "deleteDetails"
            };
            setAction(undefined);
            submit(data as any, { method: "delete", action: getFullPath("expenseCategorySettings"), encType: "application/json" });
        }
    };

    const onAddUpdateExpenseCategoryHandler = (details: UpdateConfigDetailsResource | UpdateConfigStatusResource) => {
        setAction(undefined);

        submit(details as any, { method: "post", action: getFullPath("expenseCategorySettings"), encType: "application/json" });
    };

    const controlsBeforeEllipsis: Control[] = [{ id: ActionId.View, content: "View", icon: faEye }];
    const controlsInEllipsis: Control[] = [
        { id: ActionId.Update, content: "Edit", icon: faEdit },
        { id: ActionId.Delete, content: "Delete", icon: faRemove },
        { id: ActionId.ToggleEnable, content: "Change to Enable", icon: faToggleOn, isActive: (item: ListItem) => !item.status },
        { id: ActionId.ToggleDisable, content: "Change to Disable", icon: faToggleOff, isActive: (item: ListItem) => item.status },
    ];

    const configInputProps: ConfigInputProps = {
        name: {
            idPrefix: "xpns",
            placeholder: "Enter Category Name",
            tooltip: "Expense category name by which you can attach the expenses while adding or updating expense/receipt/bill",
        },

        description: {
            idPrefix: "xpns",
            placeholder: "Enter Desription for Expense Category",
        }
    };

    fcLogger.info("loaderData= ", loaderData, ", actionData= ", actionData);
    const errorMessage = loaderData.type === "error" ? loaderData.errorMessage : actionData?.type === "error" ? actionData.errorMessage : null;
    const categoryTags = loaderData.type === "success" ? loaderData.data.categoryTags : [];

    return (
        <>
            <div className="columns">
                <div className="column has-text-centered">
                    <h1 className="title">List of Expense Category</h1>
                </div>
                <div className="column"></div>
            </div>
            <div className="columns">
                <div className="column is-two-fifths">

                    <Switch
                        initialStatus={ enableFilter }
                        id="xpnsCtgryEnableFilter"
                        labelWhenOn="Filtered by enabled"
                        labelWhenOff="All Categories"
                        tooltip="Toggle to filter by status enable or show all"
                        onChange={ setEnableFilter }
                    />

                    <List
                        items={ expenseCategoryItems }
                        onControlRequest={ onRequestListControlExpenseCategoryHandler }
                        controlsInEllipsis={ controlsInEllipsis }
                        controlsBeforeEllipsis={ controlsBeforeEllipsis }
                    />

                </div>
                <div className="column">
                    <section>
                        <div className="buttons is-right px-5 mx-5">
                            {
                                action && action.type === "view" &&
                                <>
                                    <button className="button is-link is-rounded" onClick={ onClickRequestDeleteExpenseCategoryHandler }> &nbsp; &nbsp; Delete &nbsp; &nbsp; </button>
                                    <button className="button is-link is-rounded" onClick={ onClickRequestUpdateExpenseCategoryHandler }> &nbsp; &nbsp; Edit &nbsp; &nbsp; </button>
                                </>
                            }
                            <button className="button is-link is-rounded" onClick={ onClickRequestAddExpenseCategoryHandler }> &nbsp; &nbsp; Add &nbsp; &nbsp; </button>
                        </div>
                    </section>
                    <section className="mt-4 pt-4 px-4">
                        {
                            errorMessage &&
                            <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp">
                                <article className="message is-danger">
                                    <div className="message-body">
                                        <ReactMarkdown children={ errorMessage } />
                                    </div>
                                </article>
                            </Animated>
                        }
                        {
                            action?.type === ActionId.View &&
                            <ViewConfig details={ action.item } />
                        }
                        {
                            // condition to create new instance 
                            action?.type === ActionId.Update && toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ categoryTags }
                                onCancel={ () => setAction(undefined) }
                                onUpdate={ onAddUpdateExpenseCategoryHandler }
                            />
                        }
                        {
                            // condition to create new instance 
                            action?.type === ActionId.Update && !toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ categoryTags }
                                onCancel={ () => setAction(undefined) }
                                onUpdate={ onAddUpdateExpenseCategoryHandler }
                            />
                        }
                        {
                            // condition to create new instance 
                            action?.type === ActionId.Add &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ categoryTags }
                                onCancel={ () => setAction(undefined) }
                                onUpdate={ onAddUpdateExpenseCategoryHandler }
                            />
                        }
                    </section>
                </div>
            </div>
            <ConfirmDialog
                id="delete-xpns-ctgry-confirm-dialog"
                content="Are you sure that you want to delete expense category?"
                title="Remove Expense Category"
                open={ action?.type === "delete" }
                onConfirm={ onDeleteConfirmHandler }
                onCancel={ () => setAction(undefined) }
                yesButtonClassname="is-danger"
            />
        </>
    );

};

export default ExpenseCategoryPage;