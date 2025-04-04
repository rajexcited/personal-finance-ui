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
import { IncomeTypeLoaderResource } from "../route-handlers/income-type-loader-action";
import { useAuth } from "../../auth";
import { ConfigAction } from "../../../shared";
import { DeviceMode, useOrientation } from "../../../hooks";


const fcLogger = getLogger("FC.settings.IncomeTypePage", null, null, "DISABLED");

export const IncomeTypePage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<IncomeTypeLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [enableFilter, setEnableFilter] = useState(true);
    const [action, setAction] = useState<TypeCategoryAction>();
    const [toggleUpdate, setToggleUpdate] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const submit = useSubmit();
    const auth = useAuth();
    const { resultedDevice: deviceMode } = useOrientation(DeviceMode.Mobile);

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

    const incomeTypeItems: ListItem[] = useMemo(() => {
        if (loaderData.type === "success") {
            const list = loaderData.data.incomeTypes.map(cfg => ({
                id: cfg.id,
                title: cfg.name + " - " + cfg.status,
                description: cfg.description,
                status: cfg.status
            }));
            if (enableFilter) {
                return list.filter(item => item.status === ConfigTypeStatus.Enable);
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

    const onClickRequestAddIncomeTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        const defaultAddConfig: ConfigResource = {
            belongsTo: ConfigTypeBelongsTo.IncomeType,
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
    const onClickRequestUpdateIncomeTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) {
            updateAction({ item: action.item, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        }
    };
    const onClickRequestDeleteIncomeTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) updateAction({ item: action.item, type: ActionId.Delete });
    };

    const onRequestListControlIncomeTypeHandler = (item: ListItem, control: Control) => {
        const cfgitem = loaderData.type === "success" && loaderData.data.incomeTypes.find(cfg => cfg.id === item.id);
        if (!cfgitem) return;

        if (control.id === ActionId.View) {
            updateAction({ item: cfgitem, type: ActionId.View });
        } else if (control.id === ActionId.Update) {
            updateAction({ item: cfgitem, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        } else if (control.id === ActionId.Delete) {
            updateAction({ item: cfgitem, type: ActionId.Delete });
        } else if (control.id === ActionId.ToggleEnable) {
            onAddUpdateIncomeTypeHandler({
                ...cfgitem,
                status: ConfigTypeStatus.Enable,
                action: ConfigAction.UpdateStatus
            });
        } else if (control.id === ActionId.ToggleDisable) {
            onAddUpdateIncomeTypeHandler({
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
            submit(data as any, { method: "delete", action: getFullPath("incomeTypeSettings"), encType: "application/json" });
        }
    };

    const onAddUpdateIncomeTypeHandler = (details: UpdateConfigDetailsResource | UpdateConfigStatusResource) => {
        updateAction(undefined);
        if (!auth.readOnly) {
            submit(details as any, { method: "post", action: getFullPath("incomeTypeSettings"), encType: "application/json" });
        }
    };

    const controlsBeforeEllipsis: Control[] = [{ id: ActionId.View, content: "View", icon: faEye, isActive: () => true }];
    const controlsInEllipsis: Control[] = [];
    if (!auth.readOnly) {
        controlsInEllipsis.push({ id: ActionId.Update, content: "Edit", icon: faEdit, isActive: () => true });
        controlsInEllipsis.push({ id: ActionId.Delete, content: "Delete", icon: faRemove, isActive: () => true });
        controlsInEllipsis.push({ id: ActionId.ToggleEnable, content: "Change to Enable", icon: faToggleOn, isActive: item => (item as unknown as ConfigResource).status === ConfigTypeStatus.Disable });
        controlsInEllipsis.push({ id: ActionId.ToggleDisable, content: "Change to Disable", icon: faToggleOff, isActive: item => (item as unknown as ConfigResource).status === ConfigTypeStatus.Enable });
    }

    const configInputProps: ConfigInputProps = {
        name: {
            idPrefix: "income-type",
            placeholder: "Enter Income Type",
            tooltip: "Income Type name by which you can attach the Income while adding or updating Income",
        },

        description: {
            idPrefix: "income-type",
            placeholder: "Enter Desription for Income Type",
        }
    };

    const tags = loaderData.type === "success" ? loaderData.data.tags : [];
    const hideListInMobile = deviceMode === DeviceMode.Mobile && (action?.type === ActionId.Add || action?.type === ActionId.Update);

    return (
        <>
            <div className="columns">
                <div className="column has-text-centered">
                    <h1 className="title">List of Income Type</h1>
                </div>
                <div className="column">&nbsp;</div>
                {
                    deviceMode === DeviceMode.Mobile && !hideListInMobile &&
                    <div className="column">
                        <div className="buttons is-right">
                            <button className="button is-link is-rounded" onClick={ onClickRequestAddIncomeTypeHandler }> &nbsp; &nbsp; Add &nbsp; &nbsp; </button>
                        </div>
                    </div>
                }
            </div>
            <div className="columns">
                { !hideListInMobile &&
                    <div className="column is-two-fifths">
                        {
                            incomeTypeItems.length > 0 &&
                            <>
                                <Switch
                                    initialStatus={ enableFilter }
                                    id="incomeTypeEnableFilter"
                                    labelWhenOn="Filtered by enabled"
                                    labelWhenOff="All Income Types"
                                    tooltip="Toggle to filter by status enable or show all"
                                    onChange={ setEnableFilter }
                                />
                                <List
                                    items={ incomeTypeItems }
                                    onControlRequest={ onRequestListControlIncomeTypeHandler }
                                    controlsInEllipsis={ controlsInEllipsis }
                                    controlsBeforeEllipsis={ controlsBeforeEllipsis }
                                    viewActionContentInMobile={
                                        action?.type === ActionId.View &&
                                        <ViewConfig details={ action.item } />
                                    }
                                />
                            </>
                        }

                        {
                            incomeTypeItems.length === 0 &&
                            <span>There are no Income Types configured.</span>
                        }
                    </div>
                }
                <div className="column">
                    { !auth.readOnly && deviceMode === DeviceMode.Desktop &&
                        <section>
                            <div className="buttons is-right px-5 mx-5">
                                {
                                    action && action.type === "view" &&
                                    <>
                                        <button className="button is-link is-rounded" onClick={ onClickRequestDeleteIncomeTypeHandler }> &nbsp; &nbsp; Delete &nbsp; &nbsp; </button>
                                        <button className="button is-link is-rounded" onClick={ onClickRequestUpdateIncomeTypeHandler }> &nbsp; &nbsp; Edit &nbsp; &nbsp; </button>
                                    </>
                                }
                                <button className="button is-link is-rounded" onClick={ onClickRequestAddIncomeTypeHandler }> &nbsp; &nbsp; Add &nbsp; &nbsp; </button>
                            </div>
                        </section>
                    }
                    <section className="view-update-config-section">
                        {
                            errorMessage &&
                            <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp" scrollBeforePlayIn={ true }>
                                <article className="message is-danger">
                                    <div className="message-body">
                                        <ReactMarkdown children={ errorMessage } />
                                    </div>
                                </article>
                            </Animated>
                        }
                        {
                            deviceMode === DeviceMode.Desktop && action?.type === ActionId.View &&
                            <ViewConfig details={ action.item } />
                        }
                        {
                            // condition to create new instance 
                            !auth.readOnly && action?.type === ActionId.Update && toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ tags }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdateIncomeTypeHandler }
                            />
                        }
                        {
                            // condition to create new instance 
                            !auth.readOnly && action?.type === ActionId.Update && !toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ tags }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdateIncomeTypeHandler }
                            />
                        }
                        {
                            // condition to create new instance 
                            !auth.readOnly && action?.type === ActionId.Add &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                sourceTags={ tags }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdateIncomeTypeHandler }
                            />
                        }
                    </section>
                </div>
            </div>
            <ConfirmDialog
                id="delete-income-type-confirm-dialog"
                content="Are you sure that you want to delete income type?"
                title="Remove Income Type"
                open={ action?.type === "delete" }
                onConfirm={ onDeleteConfirmHandler }
                onCancel={ () => updateAction(undefined) }
                yesButtonClassname="is-danger"
            />
        </>
    );

};

