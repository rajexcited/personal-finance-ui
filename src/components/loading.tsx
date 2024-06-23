import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent } from "react";
import "./loading.css";


interface LoadSpinnerProps {
    loading: boolean;
    insideModal?: boolean;
    color?: string;
}

const LoadSpinner: FunctionComponent<LoadSpinnerProps> = (props) => {

    if (!props.insideModal) {

        return (
            <div className={ `modal spinner ${props.loading ? "is-active" : ""}` }>
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
        <div className={ `nomodal spinner ${props.loading ? "is-active" : ""}` }>
            <div className={ `has-text-centered ${props.color ? props.color : ""}` }>
                <span className="icon">
                    <FontAwesomeIcon icon={ faSpinner } className="fa-pulse" />
                </span>
            </div>
        </div>
    );
};

export default LoadSpinner;