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


const PymtAccountTypePage: FunctionComponent = () => {
    const loaderData = useLoaderData() as ConfigType[];
    const actionData = useActionData() as { errorMessage: string; };
    const [enableFilter, setEnableFilter] = useState(true);
    const [action, setAction] = useState<TypeCategoryAction>();
    const [toggleUpdate, setToggleUpdate] = useState(false);
    const submit = useSubmit();

    const pymtAccountTypeItems: ListItem[] = useMemo(() => {
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

    const onClickRequestAddPymtAccTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        const defaultAddConfig: ConfigType = {
            belongsTo: ConfigTypeBelongsTo.PaymentAccountType,
            configId: uuidv4(),
            description: "",
            name: "",
            value: "",
            relations: [],
            status: ConfigTypeStatus.enable,
        };
        setAction({ item: defaultAddConfig, type: ActionId.Add });
    };

    const onClickRequestUpdatePymtAccTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) {
            setAction({ item: action.item, type: ActionId.Update });
            setToggleUpdate(prev => !prev);
        }
    };

    const onClickRequestDeletePymtAccTypeHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (action?.item) setAction({ item: action.item, type: ActionId.Delete });
    };

    const onRequestListControlPymtAccTypeHandler = (item: ListItem, control: Control) => {
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
            onAddUpdatePymtAccTypeHandler({
                ...cfgitem,
                status: ConfigTypeStatus.enable
            });
        } else if (control.id === ActionId.ToggleDisable) {
            onAddUpdatePymtAccTypeHandler({
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
            submit(data, { method: "delete", action: PAGE_URL.pymtAccountTypeSettings.fullUrl, encType: "application/json" });
        }
    };

    const onAddUpdatePymtAccTypeHandler = (details: ConfigType) => {
        setAction(undefined);
        const data: any = {
            ...details
        };
        submit(data, { method: "post", action: PAGE_URL.pymtAccountTypeSettings.fullUrl, encType: "application/json" });
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
            idPrefix: "pymt-acc",
            placeholder: "Enter Account Type Name",
            tooltip: "Payment Account type name by which you can attach the payment account while adding or updating payment account",
        },

        description: {
            idPrefix: "pymt-acc",
            placeholder: "Enter Desription for Payment Account",
        }
    };

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

                </div>
                <div className="column">
                    <section>
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
                                onUpdate={ onAddUpdatePymtAccTypeHandler }
                            />
                        }
                        {
                            action?.type === ActionId.Update && !toggleUpdate &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                onCancel={ () => setAction(undefined) }
                                onUpdate={ onAddUpdatePymtAccTypeHandler }
                            />
                        }
                        {
                            action?.type === ActionId.Add &&
                            <UpdateConfig
                                details={ action.item }
                                inputProps={ configInputProps }
                                onCancel={ () => setAction(undefined) }
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
                onCancel={ () => setAction(undefined) }
                yesButtonClassname="is-danger"
            />
        </>
    );

};

export default PymtAccountTypePage;