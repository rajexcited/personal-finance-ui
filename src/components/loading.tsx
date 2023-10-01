import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useEffect } from "react";
import "./loading.css";
import { useDebounceState } from "../hooks";


interface LoadSpinnerProps {
    loading: boolean;
}

const LoadSpinner: FunctionComponent<LoadSpinnerProps> = (props) => {
    // const [waiting, setWaiting] = useDebounceState(true);

    // useEffect(() => {
    //     setWaiting(props.loading);
    // }, [props.loading]);

    return (
        <div className={ `modal spinner ${props.loading ? "is-active" : ""}` }>
            <div className="modal-background"></div>
            <div className="modal-card">
                <section className="modal-card-body">
                    <div className="has-text-centered">
                        <span className="icon">
                            <FontAwesomeIcon icon={ faSpinner } className="fa-pulse" />
                        </span>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LoadSpinner;