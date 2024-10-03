import { FunctionComponent, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import { faEdit, faEye, faRemove, faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import { Animated, ConfirmDialog, List, Switch } from "../../../../components";
import { Control, ListItem } from "../../../../components/list";
import { getFullPath } from "../../../root";
import { useAuth } from "../../../auth";
import { ActionId, ConfigTypeStatus, DeleteSharePersonResource, getLogger, RouteHandlerResponse, SharePersonResource, UpdateSharePersonResource, UpdateSharePersonStatusResource } from "../../services";
import { SharePersonLoaderResource } from "../../route-handlers/share-person-loader-action";
import { ConfigAction } from "../../../../shared";
import { ViewSharePerson } from "./view-share-person";
import { UpdateSharePerson } from "./update-share-person";


const fcLogger = getLogger("FC.settings.SharePersonPage", null, null, "DISABLED");

interface TypeSharePersonAction {
    item: SharePersonResource,
    type: ActionId;
}

export const SharePersonPage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<SharePersonLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [enableFilter, setEnableFilter] = useState(true);
    const [action, setAction] = useState<TypeSharePersonAction>();
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

    const sharePersonItems: ListItem[] = useMemo(() => {
        if (loaderData.type === "success") {
            const list = loaderData.data.sharePersons.map(sp => {
                const name = sp.nickName || `${sp.firstName} ${sp.lastName}`;
                return {
                    id: sp.id,
                    title: `${name} - ${sp.status}`,
                    description: sp.description,
                    status: sp.status === ConfigTypeStatus.Enable
                };
            });
            if (enableFilter) {
                return list.filter(item => item.status);
            }
            return list;
        }
        return [];
    }, [loaderData, enableFilter]);

    const updateAction = (newAction?: TypeSharePersonAction) => {
        setAction(prev => {
            if (newAction && prev?.type !== newAction.type) {
                setErrorMessage("");
            }
            return newAction;
        });
    };

    const onClickRequestAddSharePersonHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        const defaultAddConfig: SharePersonResource = {
            id: uuidv4(),
            description: "",
            status: ConfigTypeStatus.Enable,
            auditDetails: { createdOn: "", updatedOn: "" },
            emailId: "",
            firstName: "",
            lastName: "",
            nickName: "",
            phone: ""
        };
        updateAction({ item: defaultAddConfig, type: ActionId.Add });
    };

    const onClickRequestUpdateSharePersonHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) {
            updateAction({ item: action.item, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        }
    };

    const onClickRequestDeleteSharePersonHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) updateAction({ item: action.item, type: ActionId.Delete });
    };

    const onRequestListControlSharePersonHandler = (item: ListItem, control: Control) => {
        const cfgitem = loaderData.type === "success" && loaderData.data.sharePersons.find(cfg => cfg.id === item.id);
        if (!cfgitem) return;

        if (control.id === ActionId.View) {
            updateAction({ item: cfgitem, type: ActionId.View });
        } else if (control.id === ActionId.Update) {
            updateAction({ item: cfgitem, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        } else if (control.id === ActionId.Delete) {
            updateAction({ item: cfgitem, type: ActionId.Delete });
        } else if (control.id === ActionId.ToggleEnable) {
            onAddUpdateSharePersonHandler({
                ...cfgitem,
                status: ConfigTypeStatus.Enable,
                action: ConfigAction.UpdateStatus
            });
        } else if (control.id === ActionId.ToggleDisable) {
            onAddUpdateSharePersonHandler({
                ...cfgitem,
                status: ConfigTypeStatus.Disable,
                action: ConfigAction.UpdateStatus
            });
        }
    };

    const onDeleteConfirmHandler = () => {
        if (action?.item && !auth.readOnly) {
            const data: DeleteSharePersonResource = {
                ...action.item,
                action: ConfigAction.DeleteDetails
            };
            updateAction(undefined);
            submit(data as any, { method: "delete", action: getFullPath("sharePersonSettings"), encType: "application/json" });
        }
    };

    const onAddUpdateSharePersonHandler = (details: UpdateSharePersonResource | UpdateSharePersonStatusResource) => {
        updateAction(undefined);
        if (!auth.readOnly) {
            submit(details as any, { method: "post", action: getFullPath("sharePersonSettings"), encType: "application/json" });
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


    return (
        <>
            <div className="columns">
                <div className="column has-text-centered">
                    <h1 className="title">List of Persons Sharing</h1>
                </div>
                <div className="column"></div>
            </div>
            <div className="columns">
                <div className="column is-two-fifths">
                    {
                        sharePersonItems.length > 0 &&
                        <>

                            <Switch
                                initialStatus={ enableFilter }
                                id="sharePersonEnableFilter"
                                labelWhenOn="Filtered by enabled"
                                labelWhenOff="All Share Persons"
                                tooltip="Toggle to filter by status enable or show all"
                                onChange={ setEnableFilter }
                            />

                            <List
                                items={ sharePersonItems }
                                onControlRequest={ onRequestListControlSharePersonHandler }
                                controlsInEllipsis={ controlsInEllipsis }
                                controlsBeforeEllipsis={ controlsBeforeEllipsis }
                            />
                        </>
                    }

                    {
                        sharePersonItems.length === 0 &&
                        <span>There are no Share Persons configured.</span>
                    }
                </div>
                <div className="column">
                    <section>
                        {
                            !auth.readOnly &&
                            <div className="buttons is-right px-5 mx-5">
                                {
                                    action && action.type === "view" &&
                                    <>
                                        <button className="button is-link is-rounded" onClick={ onClickRequestDeleteSharePersonHandler }> &nbsp; &nbsp; Delete &nbsp; &nbsp; </button>
                                        <button className="button is-link is-rounded" onClick={ onClickRequestUpdateSharePersonHandler }> &nbsp; &nbsp; Edit &nbsp; &nbsp; </button>
                                    </>
                                }
                                <button className="button is-link is-rounded" onClick={ onClickRequestAddSharePersonHandler }> &nbsp; &nbsp; Add &nbsp; &nbsp; </button>
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
                            <ViewSharePerson details={ action.item } />
                        }
                        {
                            // condition to create new instance 
                            !auth.readOnly && action?.type === ActionId.Update && toggleUpdate &&
                            <UpdateSharePerson
                                details={ action.item }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdateSharePersonHandler }
                            />
                        }
                        {
                            // condition to create new instance 
                            !auth.readOnly && action?.type === ActionId.Update && !toggleUpdate &&
                            <UpdateSharePerson
                                details={ action.item }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdateSharePersonHandler }
                            />
                        }
                        {
                            // condition to create new instance 
                            !auth.readOnly && action?.type === ActionId.Add &&
                            <UpdateSharePerson
                                details={ action.item }
                                onCancel={ () => updateAction(undefined) }
                                onUpdate={ onAddUpdateSharePersonHandler }
                            />
                        }
                    </section>
                </div>
            </div>
            <ConfirmDialog
                id="delete-share-person-confirm-dialog"
                content="Are you sure that you want to delete Share Person?"
                title="Remove Share Person"
                open={ action?.type === "delete" }
                onConfirm={ onDeleteConfirmHandler }
                onCancel={ () => updateAction(undefined) }
                yesButtonClassname="is-danger"
            />
        </>
    );

};

