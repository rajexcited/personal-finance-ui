import { FunctionComponent, useState } from "react";
import { getLogger, testAttributes } from "../shared";
import { LoadSpinner } from "./loading";
import Animated from "./animated";


interface ViewDialogProps {
    id: string;
    /** when open dialog upon initialized  */
    openDefault: boolean;
    /** if content is not present, default loading indicator will be displayed */
    children: JSX.Element | JSX.Element[] | React.ReactNode;
    /** default is false. if true, show loading indicator */
    loading?: boolean;
    /** title to dialog */
    title?: string;
    /** when dialog is closed, link will appear to open it */
    linkText: string;
    /** adds animation to link hide or show */
    animateLink: boolean;
    /** true to animate play in, false animate play out  */
    isLinkPlayIn: boolean;
}

const fcLogger = getLogger("FC.ViewDialog", null, null, "DISABLED");

export const ViewDialog: FunctionComponent<ViewDialogProps> = (props) => {
    const [isOpen, setOpen] = useState(props.openDefault);

    const onClickCloseHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        const logger = getLogger("onClickCloseHandler", fcLogger);
        event.preventDefault();
        setOpen(false);
    };

    const onClickOpenHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        const logger = getLogger("onClickOpenHandler", fcLogger);
        event.preventDefault();
        setOpen(true);
    };

    let dialogContent = props.children;
    if (dialogContent && typeof dialogContent === "string") {
        dialogContent = <span> { props.children } </span>;
    }
    fcLogger.debug("isOpen?", isOpen);


    return (
        <section className="view-dialog" { ...testAttributes("view-dialog", "dialog-id", props.id) }>
            {
                props.animateLink &&
                <Animated animatedIn="flipInX" animatedOut="flipOutX" isPlayIn={ props.isLinkPlayIn } animateOnMount={ true }  >
                    <button className="button is-text view-dialog-button" onClick={ onClickOpenHandler }
                        { ...testAttributes("open-dialog-action") }> { props.linkText } </button>
                </Animated>
            }
            {
                !props.animateLink &&
                <button className="button is-text view-dialog-button" onClick={ onClickOpenHandler }
                    { ...testAttributes("open-dialog-action") }> { props.linkText } </button>
            }
            <div className={ `modal view-dialog-model ${isOpen ? "is-active" : ""}` }>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header className="modal-card-head is-small">
                        <p className="modal-card-title">{ props.title || <>&nbsp;</> }</p>
                        <button className="delete" aria-label="close" onClick={ onClickCloseHandler }
                            { ...testAttributes("close-dialog-action") }
                        ></button>
                    </header>
                    <section className="modal-card-body">
                        {
                            !props.loading &&
                            dialogContent
                        }
                        <LoadSpinner
                            loading={ !!props.loading }
                            insideModal={ true }
                            id="dialog-content"
                        />
                    </section>
                </div>
            </div>
        </section>
    );
};

