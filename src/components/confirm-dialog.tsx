import { FunctionComponent, ReactNode, useEffect, useState } from "react";


interface ConfirmDialogProps {
    id: string;
    open: boolean;
    content: ReactNode;
    title?: string;
    noButtonContent?: string;
    yesButtonContent?: string;
    yesButtonClassname?: string;
    onConfirm (): void;
    onCancel?(): void;
}

const ConfirmDialog: FunctionComponent<ConfirmDialogProps> = (props) => {
    const [isOpen, setOpen] = useState(props.open);

    useEffect(() => {
        if (props.open && !isOpen) {
            setOpen(true);
        }
    }, [props.open]);

    const onClickCloseOrCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setOpen(false);
        if (props.onCancel) props.onCancel();
    };

    const onClickConfirmHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setOpen(false);
        props.onConfirm();
    };

    let content = props.content;
    if (typeof content === "string") {
        content = <span> { props.content } </span>;
    }

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
                    <button className="button" onClick={ onClickCloseOrCancelHandler }>{ props.noButtonContent || "No" }</button>
                    <button className={ `button ${props.yesButtonClassname || ""}` } onClick={ onClickConfirmHandler }> { props.yesButtonContent || "Yes" } </button>
                </footer>
            </div>
        </div>
    );
};

export default ConfirmDialog;