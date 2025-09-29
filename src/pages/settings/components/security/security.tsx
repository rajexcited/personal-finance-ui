import "./security.css";
import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useSubmit } from "react-router";
import ReactMarkdown from "react-markdown";
import { Animated } from "../../../../components";
import { UpdateUserPasswordResource, useAuth, UserDetailsResource, UserLoginResource } from "../../../auth";
import { getFullPath } from "../../../root";
import { getLogger, RouteHandlerResponse, ActionRelation } from "../../services";
import { ChangePasswordSection } from "./change-pwd";
import { ActionState, UserAction } from "./user-action";
import { DeleteAccountSection } from "./delete-acc";


const defaultUserAction: UserAction = { state: ActionState.NoAction };
const fcLogger = getLogger("FC.settings.SecurityPage", null, null, "DISABLED");

export const SecurityPage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<UserDetailsResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [userAction, setUserAction] = useState<UserAction>(defaultUserAction);
    const [errorMessage, setErrorMessage] = useState("");
    const submit = useSubmit();
    const auth = useAuth();

    useEffect(() => {
        if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
        } else if (actionData?.type === "error") {
            setUserAction(prev => {
                if (prev.state !== ActionState.NoAction) {
                    return { state: ActionState.UserRequest, type: prev.type };
                }
                return prev;
            });
            setErrorMessage(actionData.errorMessage);
        } else if (loaderData.type === "success" || actionData?.type === "success") {
            setUserAction({ ...defaultUserAction });
            setErrorMessage("");
        }
    }, [actionData, loaderData]);

    const onCancelHandler = () => {
        const logger = getLogger("onCancelHandler", fcLogger);
        const newUserAction = { ...defaultUserAction };
        logger.debug("previous userAction =", { ...userAction }, " new userAction =", { ...newUserAction });
        setUserAction(newUserAction);
        setErrorMessage("");
    };

    const onSubmitPasswordChangeHandler = (data: UpdateUserPasswordResource) => {
        const logger = getLogger("onSubmitPasswordChangeHandler", fcLogger);
        if (!auth.readOnly) {
            const newUserAction = { state: ActionState.UserSubmit, type: ActionRelation.ChangePassword };
            submit({ ...data, type: ActionRelation.ChangePassword }, { method: "post", action: getFullPath("securitySettings"), encType: "application/json" });

            logger.debug("previous userAction =", { ...userAction }, " new userAction =", { ...newUserAction });
            setUserAction(newUserAction);
        }
    };

    const onSubmitDeleteAccountHandler = (data: UserLoginResource) => {
        const logger = getLogger("onSubmitDeleteAccountHandler", fcLogger);
        if (!auth.readOnly) {

            const newUserAction = { state: ActionState.UserSubmit, type: ActionRelation.DeleteAccount };
            submit({ ...data, type: ActionRelation.DeleteAccount }, { method: "post", action: getFullPath("securitySettings"), encType: "application/json" });

            logger.debug("previous userAction =", { ...userAction }, " new userAction =", { ...newUserAction });
            setUserAction(newUserAction);
        }
    };

    fcLogger.debug("userAction =", userAction, " userAction.state === ActionState.NoAction? ", (userAction.state === ActionState.NoAction));


    return (
        <section className="security-settings">
            <div className="columns">
                <div className="column">
                    <h2 className="title">Security Settings</h2>
                </div>
            </div>
            <Animated animateOnMount={ false } isPlayIn={ !!errorMessage && userAction.state !== ActionState.UserSubmit } animatedIn="fadeInDown" animatedOut="fadeOutUp" isVisibleAfterAnimateOut={ false } scrollBeforePlayIn={ true }>
                <div className="columns">
                    <div className="column">
                        <article className="message is-danger mb-3">
                            <div className="message-body">
                                <ReactMarkdown children={ errorMessage } />
                            </div>
                        </article>
                    </div>
                </div>
            </Animated>

            <ChangePasswordSection
                reset={ userAction.state === ActionState.NoAction }
                onCancel={ onCancelHandler }
                onSubmit={ onSubmitPasswordChangeHandler }
                readOnly={ auth.readOnly }
                error={ errorMessage }
            />
            <p>&nbsp;</p>
            <DeleteAccountSection
                reset={ userAction.state === ActionState.NoAction }
                onCancel={ onCancelHandler }
                onSubmit={ onSubmitDeleteAccountHandler }
                readOnly={ auth.readOnly }
                error={ errorMessage }
            />
        </section>
    );

};

