import "./confirm-dialog.css";
import { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { getLogger } from "../shared";


interface ConfirmDialogProps {
    /** unique id assigned to component attributes - id and class */
    id: string;
    /** when true, dialog needs to be opened */
    open: boolean;
    /** dialog popup content can be any */
    content: ReactNode;
    /** title for popup */
    title?: string;
    /** instead of "No", if wantto customize */
    noButtonContent?: string;
    /** custom class to be added to yes button. for example, make it larger or smaller; change color; etc. */
    noButtonClassname?: string;
    /** instead of "Yes", if wantto customize */
    yesButtonContent?: string;
    /** custom class to be added to yes button. for example, make it larger or smaller; change color; etc. */
    yesButtonClassname?: string;
    /** will be called when user choose to substaintiate the dialog */
    onConfirm (): void;
    /** will be called when user choose to abondon to take action and close the dialog */
    onCancel (): void;
    /** this custom validation will be called before calling confirm handler if configure. 
     * if validation responds true, confirm handler will be called, otherwise dialog will be open for user to take action. */
    validateBeforeConfirm?(): boolean;
}

const fcLogger = getLogger("FC.ConfirmDialog", null, null, "DISABLED");

const ConfirmDialog: FunctionComponent<ConfirmDialogProps> = (props) => {
    const [isOpen, setOpen] = useState(props.open);
    const [validationFail, setValidationFail] = useState(false);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[props.open, isOpen]", fcLogger);

        logger.debug("props.open? ", props.open, "isOpen?", isOpen, "props.open && !isOpen? ", (props.open && !isOpen));
        if (props.open && !isOpen) {
            setOpen(true);
        }
    }, [props.open, isOpen]);

    const onClickCloseOrCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        const logger = getLogger("onClickCloseOrCancelHandler", fcLogger);
        event.preventDefault();
        logger.debug("isOpen?", isOpen, "setting it to false, cancelled? ", !!props.onCancel);
        setOpen(false);
        if (props.onCancel) props.onCancel();
    };

    const onClickConfirmHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        const logger = getLogger("onClickConfirmHandler", fcLogger);
        event.preventDefault();
        const isValid = props.validateBeforeConfirm ? props.validateBeforeConfirm() : true;
        logger.debug("isOpen?", isOpen, "setting it to false if valid=true", "isValid? ", isValid);
        if (isValid) {
            setOpen(false);
            props.onConfirm();
        } else {
            setValidationFail(true);
        }
    };

    let content = props.content;
    if (typeof content === "string") {
        content = <span> { props.content } </span>;
    }

    fcLogger.debug("isOpen?", isOpen);

    return (
        <div className={ `modal confirm-dialog ${isOpen ? "is-active" : ""} ${props.id}` } id={ props.id }>
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head is-small">
                    <p className="modal-card-title">{ props.title || <>&nbsp;</> }</p>
                    <button className="delete" aria-label="close" onClick={ onClickCloseOrCancelHandler }></button>
                </header>
                <section className="modal-card-body">
                    { content }
                    { validationFail &&
                        <p className="help is-danger">validation failed. please try again.</p>
                    }
                </section>
                <footer className="modal-card-foot is-small">
                    <div className="buttons">
                        <button className={ `button ${props.noButtonClassname || ""}` } onClick={ onClickCloseOrCancelHandler }>{ props.noButtonContent || "No" }</button>
                        <button className={ `button ${props.yesButtonClassname || ""}` } onClick={ onClickConfirmHandler }> { props.yesButtonContent || "Yes" } </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ConfirmDialog;