import "./change-pwd.css";
import { FormEventHandler, FunctionComponent, MouseEventHandler, useState, useEffect } from "react";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { ConfirmDialog, Input, InputValidateResponse, InputValidators } from "../../../../components";
import { UpdateUserPasswordResource } from "../../../auth";
import { ActionState } from "./user-action";
import { getLogger } from "../../services";
import { LoggerBase } from "../../../../shared";


interface ChangePasswordSectionProps {
    reset: boolean;
    onSubmit: (data: UpdateUserPasswordResource) => void;
    onCancel: () => void;
    readOnly: boolean;
    error: string;
}

const fcLogger = getLogger("FC.settings.security.ChangePasswordSection", null, null, "DISABLED");

export const ChangePasswordSection: FunctionComponent<ChangePasswordSectionProps> = (props) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [invalidFormElements, setInvalidFormElements] = useState<string[]>([]);
    const [actionState, setActionState] = useState(ActionState.NoAction);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[props.reset]", fcLogger);
        logger.debug("prev values, current password =", currentPassword, " newPassword =", newPassword, " actionState =", actionState);
        if (actionState === ActionState.NoAction) {
            setCurrentPassword("");
            setNewPassword("");
            setInvalidFormElements(["password-current", "password-new"]);
            logger.debug("password has been reset and invalidFormElement list has been re-initialized");
        }
    }, [actionState, setCurrentPassword, setNewPassword, setInvalidFormElements]);

    useEffect(() => {
        setActionState(prev => {
            if (prev !== ActionState.NoAction && props.error) {
                return ActionState.NoAction;
            }
            return prev;
        });
    }, [props.error, setActionState]);

    const onClickRequestHandler: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        if (actionState === ActionState.NoAction) {
            setActionState(ActionState.UserRequest);
        }
    };

    const onCancelHandler = () => {
        setActionState(ActionState.NoAction);
        props.onCancel();
    };

    const isValidForm = () => {
        const logger = getLogger("isValidForm", fcLogger);
        if (invalidFormElements.length > 0) {
            logger.debug("form is invalid, cannot submit", "invalidFormElements =", invalidFormElements);
            return false;
        }
        logger.debug("form is valid");
        return true;
    };

    const onSubmitHandler = () => {
        if (isValidForm()) {
            setActionState(ActionState.UserSubmit);
            const data: UpdateUserPasswordResource = { password: currentPassword, newPassword: newPassword };
            props.onSubmit(data);
        }
    };

    const validatePasswordPattern = InputValidators.passwordValidator();
    const validatePasswordNotSame = (pwdVal: string, value: string, logger: LoggerBase) => {
        logger.debug("value !== pwdVal? ", value !== pwdVal, "value =", value, "pwdVal =", pwdVal);
        const notsameResult: InputValidateResponse = {
            isValid: value !== pwdVal,
            errorMessage: "new password should not be same as current password",
        };
        return notsameResult;
    };

    const validatePassword = (pwdGetter: () => string, value: string) => {
        const logger = getLogger("validatePassword", fcLogger);
        const validateResult = validatePasswordPattern(value);
        logger.debug("validateResult.isValid? ", validateResult.isValid);
        if (!validateResult.isValid) {
            return validateResult;
        }
        return validatePasswordNotSame(pwdGetter(), value, logger);
    };

    const getNewPassword = () => newPassword;
    const getCurrentPassword = () => currentPassword;

    const validateCurrentPassword = validatePassword.bind(null, getNewPassword);
    const validateNewPassword = validatePassword.bind(null, getCurrentPassword);

    const onFormInvalidHandler: FormEventHandler<HTMLFormElement> = (event) => {
        const logger = getLogger("onFormInvalidHandler", fcLogger);
        event.preventDefault();
        logger.debug("event", event);
        setInvalidFormElements(prev => {
            const inputelm = event.target as HTMLInputElement;
            if (prev.includes(inputelm.name)) {
                logger.debug("invalid input name already exists, name =", inputelm.name, " prev =", prev);
                return prev;
            }
            logger.debug("invalid input name not exists, name =", inputelm.name, ". adding to invalid name list, prev =", prev);
            return [...prev, inputelm.name];
        });
    };

    const onFormChangeHandler: FormEventHandler<HTMLFormElement> = (event) => {
        const logger = getLogger("onFormChangeHandler", fcLogger);
        event.preventDefault();
        logger.debug("event", event);
        setInvalidFormElements(prev => {
            const inputelm = event.target as HTMLInputElement;

            logger.debug("valid input found, name =", inputelm.name, ". so removing from invalid list, prev =", prev);
            return prev.filter(elm => elm !== inputelm.name);
        });
    };

    const content = <form onInvalid={ onFormInvalidHandler } onChange={ onFormChangeHandler } >
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
            validate={ validateCurrentPassword }
            autocomplete="current-password"
            disabled={ actionState === ActionState.NoAction }
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
            validate={ validateNewPassword }
            autocomplete="new-password"
            disabled={ actionState === ActionState.NoAction }
        />
    </form>;

    fcLogger.debug("currentPassword =", currentPassword, "newPassword =", newPassword, "invalidFormElements =", invalidFormElements);

    return (
        <section>
            <div className="columns">
                <div className="column dwp is-4">
                    <ConfirmDialog
                        id="change-pwd-confirm-dialog"
                        content={ content }
                        title="Change Password"
                        open={ actionState === ActionState.UserRequest }
                        onConfirm={ onSubmitHandler }
                        onCancel={ onCancelHandler }
                        yesButtonContent="Save"
                        validateBeforeConfirm={ isValidForm }
                    />

                    <button className="button is-dark" onClick={ onClickRequestHandler } disabled={ props.readOnly || actionState !== ActionState.NoAction }> Change password </button>

                </div>
            </div >
        </section>
    );

};

