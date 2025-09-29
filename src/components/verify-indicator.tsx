import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useEffect, useState } from "react";
import ConfirmDialog from "./confirm-dialog";
import "./verify-indicator.css";
import { formatTimestamp, getDateInstance, getLogger, testAttributes } from "../shared";

interface VerifyIndicatorProps {
    id: string;
    labelPrefix?: string;
    verifiedDateTime?: Date | string;
    verifiedDateFormat?: string;
    onChange?(datetime?: Date): void;
    disabled?: boolean;
    className?: string;
}


const fcLogger = getLogger("FC.VerifyIndicator", null, null, "DISABLED");
const VerifyIndicator: FunctionComponent<VerifyIndicatorProps> = (props) => {
    const [openModal, setOpenModal] = useState(false);
    const [verifiedDate, setVerifiedDate] = useState("");

    useEffect(() => {
        const dateInstance = getDateInstance(props.verifiedDateTime, props.verifiedDateFormat);
        if (props.verifiedDateTime && dateInstance) {
            setVerifiedDate(formatTimestamp(dateInstance, "MMM DD, YYYY"));
        } else {
            setVerifiedDate("");
        }
    }, [props.verifiedDateTime]);

    const onClickVerifyHandler = () => {
        const logger = getLogger("onClickVerifyHandler", fcLogger);
        logger.debug("props.disabled? ", props.disabled, "openModal? ", openModal);
        if (props.disabled) {
            return;
        }
        setOpenModal(false);
        if (props.onChange) {
            if (verifiedDate) props.onChange();
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

    const verifiedConfirmDialogContent = verifiedDate ?
        "Really, Do you want to un-verify this expense?" :
        "Do you want to verify this expense manually?";

    fcLogger.debug("openModal? ", openModal);

    return (
        <div className="field verify-indicator" { ...testAttributes(props.id) }>
            {
                !props.disabled && props.labelPrefix &&
                <label className="label is-invisible">{ props.labelPrefix }</label>
            }
            <div className="control">
                { verifiedDate &&
                    <span className="icon-text">
                        <span className={ `icon has-text-success ${badgeSizeClass} ${props.className || ""} tooltip is-tooltip-multiline is-tooltip-top` } data-tooltip={ "verified on " + verifiedDate }>
                            <FontAwesomeIcon icon={ faCheckCircle } />
                        </span>
                        { !props.disabled &&
                            <button className="button is-success is-inverted is-medium" onClick={ onClickModalOpenHandler } { ...testAttributes("verified-button", "verified-date", verifiedDate) }> { props.labelPrefix } verified </button>
                        }
                    </span>
                }
                { !verifiedDate &&
                    <span className="icon-text">
                        <span className={ `icon has-text-danger ${badgeSizeClass} ${props.className || ""} tooltip is-tooltip-multiline is-tooltip-top` } data-tooltip="not verified" >
                            <FontAwesomeIcon icon={ faTimesCircle } />
                        </span>
                        { !props.disabled &&
                            <button className="button is-danger is-inverted is-medium" onClick={ onClickModalOpenHandler } { ...testAttributes("unverified-button") }> { props.labelPrefix } un-verified </button>
                        }
                    </span>
                }
                {
                    !props.disabled &&
                    <ConfirmDialog
                        id={ props.id + "-verify-confirm-dialog" }
                        open={ openModal }
                        content={ verifiedConfirmDialogContent }
                        yesButtonClassname={ verifiedDate ? "is-danger" : "is-success" }
                        onConfirm={ onClickVerifyHandler }
                        onCancel={ onClickVerifyCancelHandler }
                    />
                }

            </div>
        </div>

    );
};

export default VerifyIndicator;