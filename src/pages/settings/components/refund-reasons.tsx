import { FunctionComponent, useEffect, useMemo, useState } from "react";
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
import { RefundReasonLoaderResource } from "../route-handlers/refund-reason-loader-action";


const fcLogger = getLogger("FC.settings.RefundReasonPage", null, null, "INFO");

export const RefundReasonPage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<RefundReasonLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [enableFilter, setEnableFilter] = useState(true);
    const [action, setAction] = useState<TypeCategoryAction>();
    const [toggleUpdate, setToggleUpdate] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const submit = useSubmit();

    useEffect(() => {
        const logger = getLogger("useEffect.dep[loaderData, actionData]", fcLogger);
        logger.debug("loaderData= ", loaderData, ", actionData= ", actionData);

        if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
        } else if (actionData?.type === "error") {
            setErrorMessage(actionData.errorMessage);
        } else {
            setErrorMessage("");
        }
    }, [loaderData, actionData]);

    const refundReasonItems: ListItem[] = useMemo(() => {
        if (loaderData.type === "success") {
            const list = loaderData.data.refundReasons.map(cfg => ({
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

    const updateAction = (newAction?: TypeCategoryAction) => {
        setAction(prev => {
            if (newAction && prev?.type !== newAction.type) {
                setErrorMessage("");
            }
            return newAction;
        });
    };

    const onClickRequestAddRefundReasonHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        const defaultAddConfig: ConfigResource = {
            belongsTo: ConfigTypeBelongsTo.RefundReason,
            id: uuidv4(),
            description: "",
            name: "",
            value: "",
            status: ConfigTypeStatus.Enable,
            auditDetails: { createdOn: "", updatedOn: "" },
            tags: []
        };
        updateAction({ item: defaultAddConfig, type: ActionId.Add });
    };
    const onClickRequestUpdateRefundReasonHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) {
            updateAction({ item: action.item, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        }
    };
    const onClickRequestDeleteRefundReasonHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) updateAction({ item: action.item, type: ActionId.Delete });
    };

    const onRequestListControlRefundReasonHandler = (item: ListItem, control: Control) => {
        const cfgitem = loaderData.type === "success" && loaderData.data.refundReasons.find(cfg => cfg.id === item.id);
        if (!cfgitem) return;

        if (control.id === ActionId.View) {
            updateAction({ item: cfgitem, type: ActionId.View });
        } else if (control.id === ActionId.Update) {
            updateAction({ item: cfgitem, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        } else if (control.id === ActionId.Delete) {
            updateAction({ item: cfgitem, type: ActionId.Delete });
        } else if (control.id === ActionId.ToggleEnable) {
            onAddUpdateRefundReasonHandler({
                ...cfgitem,
                status: ConfigTypeStatus.Enable,
                action: "updateStatus"
            });
        } else if (control.id === ActionId.ToggleDisable) {
            onAddUpdateRefundReasonHandler({
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
            updateAction(undefined);
            submit(data as any, { method: "delete", action: getFullPath("refundReasonSettings"), encType: "application/json" });
        }
    };

    const onAddUpdateRefundReasonHandler = (details: UpdateConfigDetailsResource | UpdateConfigStatusResource) => {
        updateAction(undefined);

        submit(details as any, { method: "post", action: getFullPath("refundReasonSettings"), encType: "application/json" });
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
            idPrefix: "refund-reason",
            placeholder: "Enter Refund Reason",
            tooltip: "Refund Reason name by which you can attach the reason while adding or updating refund",
        },

        description: {
            idPrefix: "refund-reason",
            placeholder: "Enter Desription for Refund Reason",
        }
    };

    const reasonTags = loaderData.type === "success" ? loaderData.data.reasonTags : [];

    return (
        <>
            <div className="columns">
                <div className="column has-text-centered">
                    <h1 className="title">List of Refund Reason</h1>
                </div>
                <div className="column"></div>
            </div>
            <div className="columns">
                <div className="column is-two-fifths">
                    {
                        refundReasonItems.length > 0 &&
                        <>
                            <Switch
                                initialStatus={ enableFilter }
                                id="refundReasonEnableFilter"
                                labelWhenOn="Filtered by enabled"
                                labelWhenOff="All Refund Reasons"
                                tooltip="Toggle to filter by status enable or show all"
                                onChange={ setEnableFilter }
                            />

                            <List
                                items={ refundReasonItems }
                                onControlRequest={ onRequestListControlRefundReasonHandler }
                                controlsInEllipsis={ controlsInEllipsis }
                                controlsBeforeEllipsis={ controlsBeforeEllipsis }
                            />
                        </>
                    }

                    {
                        refundReasonItems.length === 0 &&
                        <span>There are no Reasons configured for Refund.</span>
                    }
                </div>
                <div className="column">
                    <section>
                        <div className="buttons is-right px-5 mx-5">
                            {
                                action && action.type === "view" &&
                                <>
                                    <button className="button is-link is-rounded" onClick={ onClickRequestDeleteRefundReasonHandler }> &nbsp; &nbsp; Delete &nbsp; &nbsp; </button>
                                    <button className="button is-link is-rounded" onClick={ onClickRequestUpdateRefundReasonHandler }> &nbsp; &nbsp; Edit &nbsp; &nbsp; </button>
                                </>
                            }
                            <button className="button is-link is-rounded" onClick={ onClickRequestAddRefundReasonHandler }> &nbsp; &nbsp; Add &nbsp; &nbsp; </button>
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
                                sourceTags={ reasonTags }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdateRefundReasonHandler }
                            />
                        }
                        {
                            // condition to create new instance 
                            action?.type === ActionId.Update && !toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ reasonTags }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdateRefundReasonHandler }
                            />
                        }
                        {
                            // condition to create new instance 
                            action?.type === ActionId.Add &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ reasonTags }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdateRefundReasonHandler }
                            />
                        }
                    </section>
                </div>
            </div>
            <ConfirmDialog
                id="delete-refund-reason-confirm-dialog"
                content="Are you sure that you want to delete refund reason?"
                title="Remove Refund Reason"
                open={ action?.type === "delete" }
                onConfirm={ onDeleteConfirmHandler }
                onCancel={ () => updateAction(undefined) }
                yesButtonClassname="is-danger"
            />
        </>
    );

};

