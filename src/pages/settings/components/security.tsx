import "./security.css";
import { FormEventHandler, FunctionComponent, MouseEventHandler, useState, useEffect } from "react";
import { Animated, Input, InputValidators } from "../../../components";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import { UserDetailsResource } from "../../auth";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { PAGE_URL } from "../../root";
import ReactMarkdown from "react-markdown";
import { RouteHandlerResponse } from "../../../services";

enum ActionState {
    NoAction = "NA",
    UserRequest = "userRequest",
    UserSubmit = "userSubmit"
}

const SecurityPage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<UserDetailsResource>;
    const actionData = useActionData() as RouteHandlerResponse<any> | null;
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [changePasswordActionState, setChangePasswordActionState] = useState(ActionState.NoAction);
    const [errorMessage, setErrorMessage] = useState("");
    const submit = useSubmit();

    useEffect(() => {
        if (actionData?.type === "error" && actionData.errorMessage !== errorMessage) {
            setChangePasswordActionState(ActionState.UserRequest);
            setErrorMessage(actionData.errorMessage);
        } else if (loaderData.type === "error" && loaderData.errorMessage !== errorMessage) {
            setErrorMessage(loaderData.errorMessage);
        }
    }, [errorMessage, actionData, loaderData]);

    useEffect(() => {
        if (loaderData.type === "success") {
            setChangePasswordActionState(ActionState.NoAction);
            setCurrentPassword("");
            setNewPassword("");
            setErrorMessage("");
        }
    }, [loaderData]);

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
        submit({ currentPasssword: currentPassword, newPassword: newPassword }, { method: "post", action: PAGE_URL.securitySettings.fullUrl });
        setChangePasswordActionState(ActionState.UserSubmit);
    };

    const validatePassword = InputValidators.passwordValidator();

    return (
        <section className="security-settings">
            <div className="columns">
                <div className="column">
                    <h2 className="title">Security Settings</h2>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <div className="email-primary">
                        <label className="label">Account Email Id (Primary): </label>
                        <h4 className="content is-medium">{ loaderData.data.emailId }</h4>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column dwp is-4">
                    { changePasswordActionState !== ActionState.NoAction &&
                        <form onSubmit={ onSubmitPasswordChangeHandler }>
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
        </section>
    );

};

export default SecurityPage;