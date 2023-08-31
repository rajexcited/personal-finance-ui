import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useState } from "react";
import "./verify-indicator.css";

export interface VerifyIndicatorProps {
    id: string;
    labelPrefix?: string;
    verifiedDateTime?: Date;
    onChange?(datetime?: Date): void;
    disabled?: boolean;
}

const VerifyIndicator: FunctionComponent<VerifyIndicatorProps> = (props) => {

    const [openModal, setOpenModal] = useState(false);

    const onClickVerifyHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        if (props.disabled) {
            event.preventDefault();
            return;
        }
        onClickModalCloseHandler(event);
        if (props.verifiedDateTime) {
            props.onChange && props.onChange();
        } else {
            props.onChange && props.onChange(new Date());
        }
    };

    const onClickModalOpenHandler: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = event => {
        event.preventDefault();
        setOpenModal(true);
    };

    const onClickModalCloseHandler: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = event => {
        event.preventDefault();
        setOpenModal(false);
    };

    return (
        <div className="field verify-indicator">
            {
                !props.disabled &&
                <label htmlFor={ props.id } className="label is-invisible">{ props.labelPrefix || props.id }</label>
            }
            <div className="control">
                { props.verifiedDateTime &&
                    <span className="icon-text">
                        <span className="icon has-text-success is-large">
                            <FontAwesomeIcon icon={ faCheckCircle } />
                        </span>
                        { !props.disabled &&
                            <button className="button is-success is-inverted is-medium" onClick={ onClickModalOpenHandler }> { props.labelPrefix } verified </button>
                        }
                    </span>
                }
                {
                    !props.verifiedDateTime && !props.disabled &&
                    <div className="mx-3">
                        <span className="is-danger notification is-light is-small">{ props.labelPrefix } un-verified </span>
                        <button className="is-link button is-small is-rounded mx-5" onClick={ onClickModalOpenHandler }>click to verify</button>
                    </div>
                }
                {
                    !props.verifiedDateTime && props.disabled &&
                    <span className="is-danger notification is-light is-small">{ props.labelPrefix } un-verified </span>
                }
                <div className={ `modal ${openModal ? "is-active" : ""}` }>
                    <div className="modal-background"></div>
                    <div className="modal-card">
                        <header className="modal-card-head is-small">
                            <p className="modal-card-title">&nbsp;</p>
                            <button className="delete" aria-label="close" onClick={ onClickModalCloseHandler }></button>
                        </header>
                        <section className="modal-card-body">
                            { !props.verifiedDateTime &&
                                <span>
                                    Do you want to verify this expense manually?
                                </span>
                            }
                            { props.verifiedDateTime &&
                                <span>
                                    Really, Do you want to un-verify this expense?
                                </span>
                            }
                        </section>
                        <footer className="modal-card-foot is-small">
                            <button className="button" onClick={ onClickModalCloseHandler }>No</button>
                            <button className={ `button ${props.verifiedDateTime ? "is-danger" : "is-success"}` } onClick={ onClickVerifyHandler }>Yes</button>
                        </footer>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default VerifyIndicator;