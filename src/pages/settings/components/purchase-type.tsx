import { FunctionComponent, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import { faEdit, faEye, faRemove, faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import { Animated, ConfirmDialog, List, Switch } from "../../../components";
import { ActionId, ConfigResource, ConfigTypeBelongsTo, ConfigTypeStatus, DeleteConfigDetailsResource, RouteHandlerResponse, TypeCategoryAction, UpdateConfigDetailsResource, UpdateConfigStatusResource, getLogger } from "../services";
import { Control, ListItem } from "../../../components/list";
import ViewConfig from "./view-config";
import UpdateConfig, { ConfigInputProps } from "./update-config";
import { getFullPath } from "../../root";
import { PurchaseTypeLoaderResource } from "../route-handlers/purchase-type-loader-action";


const fcLogger = getLogger("FC.settings.PurchaseTypePage", null, null, "INFO");

export const PurchaseTypePage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<PurchaseTypeLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [enableFilter, setEnableFilter] = useState(true);
    const [action, setAction] = useState<TypeCategoryAction>();
    const [toggleUpdate, setToggleUpdate] = useState(false);
    const submit = useSubmit();

    const purchaseTypeItems: ListItem[] = useMemo(() => {
        if (loaderData.type === "success") {
            const list = loaderData.data.purchaseTypes.map(cfg => ({
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

    const onClickRequestAddPurchaseTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        const defaultAddConfig: ConfigResource = {
            belongsTo: ConfigTypeBelongsTo.PurchaseType,
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
    const onClickRequestUpdatePurchaseTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) {
            setAction({ item: action.item, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        }
    };
    const onClickRequestDeletePurchaseTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) setAction({ item: action.item, type: ActionId.Delete });
    };

    const onRequestListControlPurchaseTypeHandler = (item: ListItem, control: Control) => {
        const cfgitem = loaderData.type === "success" && loaderData.data.purchaseTypes.find(cfg => cfg.id === item.id);
        if (!cfgitem) return;

        if (control.id === ActionId.View) {
            setAction({ item: cfgitem, type: ActionId.View });
        } else if (control.id === ActionId.Update) {
            setAction({ item: cfgitem, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        } else if (control.id === ActionId.Delete) {
            setAction({ item: cfgitem, type: ActionId.Delete });
        } else if (control.id === ActionId.ToggleEnable) {
            onAddUpdatePurchaseTypeHandler({
                ...cfgitem,
                status: ConfigTypeStatus.Enable,
                action: "updateStatus"
            });
        } else if (control.id === ActionId.ToggleDisable) {
            onAddUpdatePurchaseTypeHandler({
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
            submit(data as any, { method: "delete", action: getFullPath("purchaseTypeSettings"), encType: "application/json" });
        }
    };

    const onAddUpdatePurchaseTypeHandler = (details: UpdateConfigDetailsResource | UpdateConfigStatusResource) => {
        setAction(undefined);

        submit(details as any, { method: "post", action: getFullPath("purchaseTypeSettings"), encType: "application/json" });
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
            idPrefix: "purchase",
            placeholder: "Enter Purchase Type Name",
            tooltip: "Purchase Type name by which you can attach the purchase while adding or updating purchase/receipt/bill",
        },

        description: {
            idPrefix: "purchase",
            placeholder: "Enter Desription for Purchase Type",
        }
    };

    fcLogger.info("loaderData= ", loaderData, ", actionData= ", actionData);
    const errorMessage = loaderData.type === "error" ? loaderData.errorMessage : actionData?.type === "error" ? actionData.errorMessage : null;
    const purchaseTags = loaderData.type === "success" ? loaderData.data.purchaseTags : [];

    return (
        <>
            <div className="columns">
                <div className="column has-text-centered">
                    <h1 className="title">List of Purchase Type</h1>
                </div>
                <div className="column"></div>
            </div>
            <div className="columns">
                <div className="column is-two-fifths">

                    <Switch
                        initialStatus={ enableFilter }
                        id="purchaseTypeEnableFilter"
                        labelWhenOn="Filtered by enabled"
                        labelWhenOff="All Purchase Types"
                        tooltip="Toggle to filter by status enable or show all"
                        onChange={ setEnableFilter }
                    />

                    <List
                        items={ purchaseTypeItems }
                        onControlRequest={ onRequestListControlPurchaseTypeHandler }
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
                                    <button className="button is-link is-rounded" onClick={ onClickRequestDeletePurchaseTypeHandler }> &nbsp; &nbsp; Delete &nbsp; &nbsp; </button>
                                    <button className="button is-link is-rounded" onClick={ onClickRequestUpdatePurchaseTypeHandler }> &nbsp; &nbsp; Edit &nbsp; &nbsp; </button>
                                </>
                            }
                            <button className="button is-link is-rounded" onClick={ onClickRequestAddPurchaseTypeHandler }> &nbsp; &nbsp; Add &nbsp; &nbsp; </button>
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
                                sourceTags={ purchaseTags }
                                onCancel={ () => setAction(undefined) }
                                onUpdate={ onAddUpdatePurchaseTypeHandler }
                            />
                        }
                        {
                            // condition to create new instance 
                            action?.type === ActionId.Update && !toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ purchaseTags }
                                onCancel={ () => setAction(undefined) }
                                onUpdate={ onAddUpdatePurchaseTypeHandler }
                            />
                        }
                        {
                            // condition to create new instance 
                            action?.type === ActionId.Add &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ purchaseTags }
                                onCancel={ () => setAction(undefined) }
                                onUpdate={ onAddUpdatePurchaseTypeHandler }
                            />
                        }
                    </section>
                </div>
            </div>
            <ConfirmDialog
                id="delete-purchase-type-confirm-dialog"
                content="Are you sure that you want to delete purchase type?"
                title="Remove Purchase Type"
                open={ action?.type === "delete" }
                onConfirm={ onDeleteConfirmHandler }
                onCancel={ () => setAction(undefined) }
                yesButtonClassname="is-danger"
            />
        </>
    );

};

