import "./confirm-dialog.css";
import { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { getLogger } from "../shared";


interface ConfirmDialogProps {
    id: string;
    open: boolean;
    content: ReactNode;
    title?: string;
    noButtonContent?: string;
    yesButtonContent?: string;
    yesButtonClassname?: string;
    onConfirm (): void;
    onCancel (): void;
    validateBeforeConfirm?(): boolean;
}

const fcLogger = getLogger("FC.ConfirmDialog", null, null, "DISABLED");

const ConfirmDialog: FunctionComponent<ConfirmDialogProps> = (props) => {
    const [isOpen, setOpen] = useState(props.open);

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
        }
    };

    let content = props.content;
    if (typeof content === "string") {
        content = <span> { props.content } </span>;
    }
    fcLogger.debug("isOpen?", isOpen);


    return (
        <div className={ `modal confirm-dialog ${isOpen ? "is-active" : ""}` }>
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head is-small">
                    <p className="modal-card-title">{ props.title || <>&nbsp;</> }</p>
                    <button className="delete" aria-label="close" onClick={ onClickCloseOrCancelHandler }></button>
                </header>
                <section className="modal-card-body">
                    { content }
                </section>
                <footer className="modal-card-foot is-small">
                    <div className="buttons">
                        <button className="button" onClick={ onClickCloseOrCancelHandler }>{ props.noButtonContent || "No" }</button>
                        <button className={ `button ${props.yesButtonClassname || ""}` } onClick={ onClickConfirmHandler }> { props.yesButtonContent || "Yes" } </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ConfirmDialog;