import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Animated, ConfirmDialog, List, Switch } from "../../../components";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import { Control, ListItem } from "../../../components/list";
import { ActionId, ConfigResource, ConfigTypeBelongsTo, ConfigTypeStatus, DeleteConfigDetailsResource, getLogger, RouteHandlerResponse, TypeCategoryAction, UpdateConfigDetailsResource, UpdateConfigStatusResource } from "../services";
import ViewConfig from "./view-config";
import UpdateConfig, { ConfigInputProps } from "./update-config";
import { faEdit, faEye, faRemove, faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { getFullPath } from "../../root";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import { PymtAccTypeLoaderResource } from "../route-handlers/pymt-acc-type-loader-action";
import { useAuth } from "../../auth";
import { ConfigAction } from "../../../shared";

const fcLogger = getLogger("FC.settings.PymtAccountTypePage", null, null, "DISABLED");

export const PymtAccountTypePage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<PymtAccTypeLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [enableFilter, setEnableFilter] = useState(true);
    const [action, setAction] = useState<TypeCategoryAction>();
    const [toggleUpdate, setToggleUpdate] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const submit = useSubmit();
    const auth = useAuth();

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

    const pymtAccountTypeItems: ListItem[] = useMemo(() => {
        if (loaderData.type === "success") {
            const list = loaderData.data.pymtAccTypes.map(cfg => ({
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

    const onClickRequestAddPymtAccTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        const defaultAddConfig: ConfigResource = {
            belongsTo: ConfigTypeBelongsTo.PaymentAccountType,
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

    const onClickRequestUpdatePymtAccTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) {
            updateAction({ item: action.item, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        }
    };

    const onClickRequestDeletePymtAccTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) updateAction({ item: action.item, type: ActionId.Delete });
    };

    const onRequestListControlPymtAccTypeHandler = (item: ListItem, control: Control) => {
        const cfgitem = loaderData.type === "success" && loaderData.data.pymtAccTypes.find(cfg => cfg.id === item.id);
        if (!cfgitem) return;

        if (control.id === ActionId.View) {
            updateAction({ item: cfgitem, type: ActionId.View });
        } else if (control.id === ActionId.Update) {
            updateAction({ item: cfgitem, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        } else if (control.id === ActionId.Delete) {
            updateAction({ item: cfgitem, type: ActionId.Delete });
        } else if (control.id === ActionId.ToggleEnable) {
            onAddUpdatePymtAccTypeHandler({
                ...cfgitem,
                status: ConfigTypeStatus.Enable,
                action: ConfigAction.UpdateStatus
            });
        } else if (control.id === ActionId.ToggleDisable) {
            onAddUpdatePymtAccTypeHandler({
                ...cfgitem,
                status: ConfigTypeStatus.Disable,
                action: ConfigAction.UpdateStatus
            });
        }
    };

    const onDeleteConfirmHandler = () => {
        if (action?.item && !auth.readOnly) {
            const data: DeleteConfigDetailsResource = {
                ...action.item,
                action: ConfigAction.DeleteDetails
            };
            updateAction(undefined);
            submit(data as any, { method: "delete", action: getFullPath("pymtAccountTypeSettings"), encType: "application/json" });
        }
    };

    const onAddUpdatePymtAccTypeHandler = (details: UpdateConfigStatusResource | UpdateConfigDetailsResource) => {
        updateAction(undefined);
        if (!auth.readOnly) {
            submit(details as any, { method: "post", action: getFullPath("pymtAccountTypeSettings"), encType: "application/json" });
        }
    };

    const controlsBeforeEllipsis: Control[] = [{ id: ActionId.View, content: "View", icon: faEye }];
    const controlsInEllipsis: Control[] = [];
    if (!auth.readOnly) {
        controlsInEllipsis.push({ id: ActionId.Update, content: "Edit", icon: faEdit });
        controlsInEllipsis.push({ id: ActionId.Delete, content: "Delete", icon: faRemove });
        controlsInEllipsis.push({ id: ActionId.ToggleEnable, content: "Change to Enable", icon: faToggleOn, isActive: (item: ListItem) => !item.status });
        controlsInEllipsis.push({ id: ActionId.ToggleDisable, content: "Change to Disable", icon: faToggleOff, isActive: (item: ListItem) => item.status });
    }

    const configInputProps: ConfigInputProps = {
        name: {
            idPrefix: "pymt-acc",
            placeholder: "Enter Account Type Name",
            tooltip: "Payment Account type name by which you can attach the payment account while adding or updating payment account",
        },

        description: {
            idPrefix: "pymt-acc",
            placeholder: "Enter Desription for Payment Account",
        }
    };

    const pymtAccTags = loaderData.type === "success" ? loaderData.data.pymtAccTags : [];

    return (
        <>
            <div className="columns">
                <div className="column has-text-centered">
                    <h1 className="title">List of Payment Account Type</h1>
                </div>
                <div className="column"></div>
            </div>
            <div className="columns">
                <div className="column is-two-fifths">
                    {
                        pymtAccountTypeItems.length > 0 &&
                        <>
                            <Switch
                                initialStatus={ enableFilter }
                                id="pymtAccTypEnableFilter"
                                labelWhenOn="Filtered by enabled"
                                labelWhenOff="All Types"
                                tooltip="Toggle to filter by status enable or show all"
                                onChange={ setEnableFilter }
                            />

                            <List
                                items={ pymtAccountTypeItems }
                                onControlRequest={ onRequestListControlPymtAccTypeHandler }
                                controlsInEllipsis={ controlsInEllipsis }
                                controlsBeforeEllipsis={ controlsBeforeEllipsis }
                            />
                        </>
                    }

                    {
                        pymtAccountTypeItems.length === 0 &&
                        <span>There are no Payment Account Types configured.</span>
                    }
                </div>
                <div className="column">
                    <section>
                        { !auth.readOnly &&
                            <div className="buttons is-right px-5 mx-5">
                                {
                                    action && action.type === "view" &&
                                    <>
                                        <button className="button is-link is-rounded" onClick={ onClickRequestDeletePymtAccTypeHandler }> &nbsp; &nbsp; Delete &nbsp; &nbsp; </button>
                                        <button className="button is-link is-rounded" onClick={ onClickRequestUpdatePymtAccTypeHandler }> &nbsp; &nbsp; Edit &nbsp; &nbsp; </button>
                                    </>
                                }
                                <button className="button is-link is-rounded" onClick={ onClickRequestAddPymtAccTypeHandler }> &nbsp; &nbsp; Add &nbsp; &nbsp; </button>
                            </div>
                        }
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
                            !auth.readOnly && action?.type === ActionId.Update && toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ pymtAccTags }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdatePymtAccTypeHandler }
                            />
                        }
                        {
                            !auth.readOnly && action?.type === ActionId.Update && !toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ pymtAccTags }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdatePymtAccTypeHandler }
                            />
                        }
                        {
                            !auth.readOnly && action?.type === ActionId.Add &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ pymtAccTags }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdatePymtAccTypeHandler }
                            />
                        }
                    </section>
                </div>
            </div>
            <ConfirmDialog
                id="delete-pymt-acc-typ-confirm-dialog"
                content="Are you sure that you want to delete payment account type?"
                title="Remove Payment Account Type"
                open={ action?.type === "delete" }
                onConfirm={ onDeleteConfirmHandler }
                onCancel={ () => updateAction(undefined) }
                yesButtonClassname="is-danger"
            />
        </>
    );

};

