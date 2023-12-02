import { FunctionComponent, useMemo, useState } from "react";
import { Animated, ConfirmDialog, List, Switch } from "../../../components";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import { ConfigType, ConfigTypeBelongsTo, ConfigTypeStatus } from "../../../services";
import { Control, ListItem } from "../../../components/list";
import { ActionId, TypeCategoryAction } from "../services";
import ViewConfig from "./view-config";
import UpdateConfig, { ConfigInputProps } from "./update-config";
import { faEdit, faEye, faRemove, faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { PAGE_URL } from "../../root";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";


const ExpenseCategoryPage: FunctionComponent = () => {
    const loaderData = useLoaderData() as ConfigType[];
    const actionData: any = useActionData();
    const [enableFilter, setEnableFilter] = useState(true);
    const [action, setAction] = useState<TypeCategoryAction>();
    const [toggleUpdate, setToggleUpdate] = useState(false);
    const submit = useSubmit();

    const expenseCategoryItems: ListItem[] = useMemo(() => {
        if (Array.isArray(loaderData)) {
            const list = loaderData.map(cfg => ({
                id: cfg.configId,
                title: cfg.name + " - " + cfg.status,
                description: cfg.description,
                status: cfg.status === ConfigTypeStatus.enable
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
        const defaultAddConfig: ConfigType = {
            belongsTo: ConfigTypeBelongsTo.ExpenseCategory,
            configId: uuidv4(),
            description: "",
            name: "",
            value: "",
            relations: [],
            status: ConfigTypeStatus.enable,
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
        const cfgitem = loaderData.find(cfg => cfg.configId === item.id);
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
                status: ConfigTypeStatus.enable
            });
        } else if (control.id === ActionId.ToggleDisable) {
            onAddUpdateExpenseCategoryHandler({
                ...cfgitem,
                status: ConfigTypeStatus.disable
            });
        }
    };

    const onDeleteConfirmHandler = () => {
        if (action?.item) {
            const data: any = {
                ...action.item
            };
            setAction(undefined);
            submit(data, { method: "delete", action: PAGE_URL.expenseCategorySettings.fullUrl, encType: "application/json" });
        }
    };

    const onAddUpdateExpenseCategoryHandler = (details: ConfigType) => {
        setAction(undefined);
        const data: any = {
            ...details
        };
        submit(data, { method: "post", action: PAGE_URL.expenseCategorySettings.fullUrl, encType: "application/json" });
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
                            actionData?.errorMessage &&
                            <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp">
                                <article className="message is-danger">
                                    <div className="message-body">
                                        <ReactMarkdown children={ actionData?.errorMessage } />
                                    </div>
                                </article>
                            </Animated>
                        }
                        {
                            action?.type === ActionId.View &&
                            <ViewConfig details={ action.item } />
                        }
                        {
                            action?.type === ActionId.Update && toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                onCancel={ () => setAction(undefined) }
                                onUpdate={ onAddUpdateExpenseCategoryHandler }
                            />
                        }
                        {
                            action?.type === ActionId.Update && !toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                onCancel={ () => setAction(undefined) }
                                onUpdate={ onAddUpdateExpenseCategoryHandler }
                            />
                        }
                        {
                            action?.type === ActionId.Add &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
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