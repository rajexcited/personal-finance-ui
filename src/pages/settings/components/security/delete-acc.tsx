import { FormEventHandler, FunctionComponent, MouseEventHandler, useState, useEffect, useMemo } from "react";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { ConfirmDialog, Input, InputValidators } from "../../../../components";
import { UserLoginResource } from "../../../auth";
import { ActionState } from "./user-action";
import { getLogger } from "../../services";


interface DeleteAccountSectionProps {
    reset: boolean;
    onSubmit: (data: UserLoginResource) => void;
    onCancel: () => void;
    readOnly: boolean;
    error: string;
}

const fcLogger = getLogger("FC.settings.security.DeleteAccountSection", null, null, "DISABLED");

export const DeleteAccountSection: FunctionComponent<DeleteAccountSectionProps> = (props) => {
    const [password, setPassword] = useState("");
    const [primaryEmailId, setPrimaryEmailId] = useState("");
    const [invalidFormElements, setInvalidFormElements] = useState<string[]>([]);
    const [actionState, setActionState] = useState(ActionState.NoAction);

    useEffect(() => {
        const _logger = getLogger("useEffect.dep[actionState]", fcLogger);
        if (actionState === ActionState.NoAction) {
            const logger = getLogger("actionState.noaction", _logger);
            setPassword(prev => {
                logger.debug("password prev value=", prev);
                return "";
            });
            setPrimaryEmailId(prev => {
                logger.debug("primaryEmailId, prev value =", prev);
                return "";
            });
            setInvalidFormElements(prev => ["emailId", "password"]);
        }
    }, [actionState]);

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
        const logger = getLogger("onCancelHandler", fcLogger);
        logger.debug("prev actionState =", actionState, " new actionState =", ActionState.NoAction);
        setActionState(ActionState.NoAction);
        props.onCancel();
    };

    const isValidForm = () => {
        const logger = getLogger("isValidForm", fcLogger);
        if (invalidFormElements.length > 0) {
            logger.debug("form is invalid, cannot submit");
            return false;
        }
        return true;
    };

    const onSubmitHandler = () => {
        const logger = getLogger("onSubmitHandler", fcLogger);
        if (isValidForm()) {
            setActionState(ActionState.UserSubmit);
            const data: UserLoginResource = { password: password, emailId: primaryEmailId };
            logger.debug("submitting data =", { ...data }, " and updating actionState to ", ActionState.UserSubmit);
            props.onSubmit(data);
        }
    };

    const validatePassword = InputValidators.passwordValidator();

    const content = useMemo(() => {
        const logger = getLogger("content.useMemo", fcLogger);
        logger.debug("actionState =", actionState);
        if (actionState !== ActionState.UserRequest) {
            return null;
        }

        const onFormInvalidHandler: FormEventHandler<HTMLFormElement> = (event) => {
            event.preventDefault();
            logger.debug("onFormInvalidHandler called with event", event);
            setInvalidFormElements(prev => {
                const inputelm = event.target as HTMLInputElement;
                if (prev.includes(inputelm.name)) {
                    return prev;
                }
                return [...prev, inputelm.name];
            });
        };

        const onFormChangeHandler: FormEventHandler<HTMLFormElement> = (event) => {
            event.preventDefault();
            logger.debug("onFormChangeHandler called with event", event);
            setInvalidFormElements(prev => {
                const inputelm = event.target as HTMLInputElement;
                return prev.filter(elm => elm !== inputelm.name);

            });
        };

        return <form onInvalid={ onFormInvalidHandler } onChange={ onFormChangeHandler } >
            <div>  <span>To confirm deletion request please authenticate your credentials.</span>  </div>
            <Input
                id="emailId"
                type="email"
                label="Email Id "
                placeholder="Enter Email id"
                leftIcon={ faEnvelope }
                initialValue={ primaryEmailId }
                onChange={ setPrimaryEmailId }
                maxlength={ 50 }
                required={ true }
                autocomplete="new-email"
            />
            <Input
                id="password"
                type="password"
                label="Password "
                placeholder="Enter password"
                leftIcon={ faLock }
                initialValue={ password }
                onChange={ setPassword }
                maxlength={ 25 }
                minlength={ 8 }
                required={ true }
                validate={ validatePassword }
                autocomplete="new-password"
            />
        </form>;
    }, [actionState, password, primaryEmailId, validatePassword]);

    fcLogger.debug("actionState =", actionState);

    return (
        <section>
            <div className="columns">
                <div className="column dwp is-4">
                    <ConfirmDialog
                        id="delete-usr-acc-confirm-dialog"
                        content={ content }
                        title="Delete User Account"
                        open={ actionState === ActionState.UserRequest }
                        onConfirm={ onSubmitHandler }
                        onCancel={ onCancelHandler }
                        yesButtonContent="Submit"
                        validateBeforeConfirm={ isValidForm }
                    />

                    <button className="button is-dark" onClick={ onClickRequestHandler } disabled={ props.readOnly || actionState !== ActionState.NoAction }> Delete Account </button>

                </div>
            </div >
        </section >
    );

};

