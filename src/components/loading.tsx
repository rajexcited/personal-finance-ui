import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useEffect } from "react";
import "./loading.css";
import { getLogger, testAttributes } from "../shared";


interface LoadSpinnerProps {
    id: string;
    loading: boolean;
    insideModal?: boolean;
    color?: string;
}

const fcLogger = getLogger("FC.LoadSpinner", null, null, "DISABLED");

export const LoadSpinner: FunctionComponent<LoadSpinnerProps> = (props) => {

    useEffect(() => {
        const logger = getLogger("useEffect.dep[props.loading, props.id]", fcLogger);
        logger.debug(props.id, props.loading);
    }, [props.loading, props.id]);

    if (!props.insideModal) {

        return (
            <div className={ `modal spinner ${props.loading ? "is-active" : ""}` } { ...testAttributes("loading-spinner", "loading-spinner-id", props.id) }>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <section className="modal-card-body">
                        <div className={ `has-text-centered ${props.color ? props.color : ""}` }>
                            <span className="icon">
                                <FontAwesomeIcon icon={ faSpinner } className="fa-pulse" />
                            </span>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className={ `nomodal spinner ${props.loading ? "is-active" : ""}` } { ...testAttributes("loading-spinner", "loading-spinner-id", props.id) }>
            <div className={ `has-text-centered ${props.color ? props.color : ""}` }>
                <span className="icon">
                    <FontAwesomeIcon icon={ faSpinner } className="fa-pulse" />
                </span>
            </div>
        </div>
    );
};
