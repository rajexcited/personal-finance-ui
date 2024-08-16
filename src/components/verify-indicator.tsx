import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useState } from "react";
import ConfirmDialog from "./confirm-dialog";
import "./verify-indicator.css";
import { getLogger } from "../services";

export interface VerifyIndicatorProps {
    id: string;
    labelPrefix?: string;
    verifiedDateTime?: Date;
    onChange?(datetime?: Date): void;
    disabled?: boolean;
    className?: string;
}


const fcLogger = getLogger("FC.VerifyIndicator", null, null, "INFO");
const VerifyIndicator: FunctionComponent<VerifyIndicatorProps> = (props) => {
    const [openModal, setOpenModal] = useState(false);

    const onClickVerifyHandler = () => {
        const logger = getLogger("onClickVerifyHandler", fcLogger);
        logger.debug("props.disabled? ", props.disabled, "openModal? ", openModal);
        if (props.disabled) {
            return;
        }
        setOpenModal(false);
        if (props.onChange) {
            if (props.verifiedDateTime) props.onChange();
            else props.onChange(new Date());
        }
    };

    const onClickVerifyCancelHandler = () => {
        const logger = getLogger("onClickVerifyCancelHandler", fcLogger);
        logger.debug("openModal? ", openModal);
        setOpenModal(false);
    };

    const onClickModalOpenHandler: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = event => {
        event.preventDefault();
        setOpenModal(true);
    };

    const badgeSizeClass = props.className && props.className.includes("is-smaller") ? "" : "is-large";

    let verifiedConfirmDialogContent = props.verifiedDateTime ?
        "Really, Do you want to un-verify this expense?" :
        "Do you want to verify this expense manually?";

    fcLogger.debug("openModal? ", openModal);

    return (
        <div className="field verify-indicator">
            {
                !props.disabled &&
                <label htmlFor={ props.id } className="label is-invisible">{ props.labelPrefix || props.id }</label>
            }
            <div className="control">
                { props.verifiedDateTime &&
                    <span className="icon-text">
                        <span className={ `icon has-text-success ${badgeSizeClass} ${props.className || ""}` }>
                            <FontAwesomeIcon icon={ faCheckCircle } />
                        </span>
                        { !props.disabled &&
                            <button className="button is-success is-inverted is-medium" onClick={ onClickModalOpenHandler }> { props.labelPrefix } verified </button>
                        }
                    </span>
                }
                { !props.verifiedDateTime &&
                    <span className="icon-text">
                        <span className={ `icon has-text-danger ${badgeSizeClass} ${props.className || ""}` }>
                            <FontAwesomeIcon icon={ faTimesCircle } />
                        </span>
                        { !props.disabled &&
                            <button className="button is-danger is-inverted is-medium" onClick={ onClickModalOpenHandler }> { props.labelPrefix } un-verified </button>
                        }
                    </span>
                }
                <ConfirmDialog
                    id={ props.id + "-verify-confirm-dialog" }
                    open={ openModal }
                    content={ verifiedConfirmDialogContent }
                    yesButtonClassname={ props.verifiedDateTime ? "is-danger" : "is-success" }
                    onConfirm={ onClickVerifyHandler }
                    onCancel={ onClickVerifyCancelHandler }
                />

            </div>
        </div>

    );
};

export default VerifyIndicator;