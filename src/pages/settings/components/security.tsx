import "./security.css";
import { FormEventHandler, FunctionComponent, MouseEventHandler, useState, useEffect } from "react";
import { Animated, Input, InputValidators } from "../../../components";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import { UserDetailsResource } from "../../auth";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { getFullPath } from "../../root";
import ReactMarkdown from "react-markdown";
import { RouteHandlerResponse } from "../../../services";
import { UpdateUserPasswordResource } from "../../auth/services";

enum ActionState {
    NoAction = "NA",
    UserRequest = "userRequest",
    UserSubmit = "userSubmit"
}

export const SecurityPage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<UserDetailsResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [changePasswordActionState, setChangePasswordActionState] = useState(ActionState.NoAction);
    const [errorMessage, setErrorMessage] = useState("");
    const submit = useSubmit();

    useEffect(() => {
        if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
        } else if (actionData?.type === "error") {
            setChangePasswordActionState(ActionState.UserRequest);
            setErrorMessage(actionData.errorMessage);
        } else if (loaderData.type === "success") {
            setChangePasswordActionState(ActionState.NoAction);
            setCurrentPassword("");
            setNewPassword("");
            setErrorMessage("");
        } else if (actionData?.type === "success") {
            setErrorMessage("");
            setChangePasswordActionState(ActionState.NoAction);

        }
    }, [actionData, loaderData]);

    const onClickChangePasswordHandler: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        setChangePasswordActionState(ActionState.UserRequest);
    };

    const onClickChangePasswordCancelHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setChangePasswordActionState(ActionState.NoAction);
        setCurrentPassword("");
        setNewPassword("");
        setErrorMessage("");
    };

    const onSubmitPasswordChangeHandler: FormEventHandler<HTMLFormElement> = event => {
        event.preventDefault();
        const data: UpdateUserPasswordResource = { password: currentPassword, newPassword: newPassword };
        submit(data as any, { method: "post", action: getFullPath("securitySettings") });
        setChangePasswordActionState(ActionState.UserSubmit);
    };

    const validatePassword = InputValidators.passwordValidator();

    const details = loaderData.type === "success" ? loaderData.data : null;

    return (
        <section className="security-settings">
            <div className="columns">
                <div className="column">
                    <h2 className="title">Security Settings</h2>
                </div>
            </div>
            <Animated animateOnMount={ false } isPlayIn={ !!errorMessage && changePasswordActionState !== ActionState.UserSubmit } animatedIn="fadeInDown" animatedOut="fadeOutUp" isVisibleAfterAnimateOut={ false } >
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
            {
                details &&
                <>

                    <div className="columns">
                        <div className="column">
                            <div className="email-primary">
                                <label className="label">Account Email Id (Primary): </label>
                                <h4 className="content is-medium">{ details.emailId }</h4>
                            </div>
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column dwp is-4">
                            { changePasswordActionState !== ActionState.NoAction &&
                                <form onSubmit={ onSubmitPasswordChangeHandler }>
                                    <Input
                                        id="password-current"
                                        type="password"
                                        label="Current Password: "
                                        placeholder="Enter Current password"
                                        initialValue={ currentPassword }
                                        leftIcon={ faLock }
                                        onChange={ setCurrentPassword }
                                        maxlength={ 25 }
                                        minlength={ 8 }
                                        required={ true }
                                        validate={ validatePassword }
                                        autocomplete="current-password"
                                        disabled={ changePasswordActionState === ActionState.UserSubmit }
                                    />
                                    <Input
                                        id="password-new"
                                        type="password"
                                        label="New Password: "
                                        placeholder="Enter New password"
                                        initialValue={ newPassword }
                                        leftIcon={ faLock }
                                        onChange={ setNewPassword }
                                        maxlength={ 25 }
                                        minlength={ 8 }
                                        required={ true }
                                        validate={ validatePassword }
                                        autocomplete="new-password"
                                        disabled={ changePasswordActionState === ActionState.UserSubmit }
                                    />
                                    <div className="buttons">
                                        <button className="button" type="button" onClick={ onClickChangePasswordCancelHandler }>Cancel</button>
                                        <button className="button is-dark" type="submit">Save New Password</button>
                                    </div>
                                </form>
                            }
                            { changePasswordActionState === ActionState.NoAction &&
                                <button className="button is-dark" onClick={ onClickChangePasswordHandler }>Change password</button>
                            }
                        </div>
                    </div>
                </>
            }
        </section>
    );

};

