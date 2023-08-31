import { FunctionComponent } from "react";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NavBar from "./navbar";

const ErrorPage: FunctionComponent = () => {
    return <div className="section">
        <h1 className="title is-1 has-text-centered has-text-danger">
            <span>Ooops!</span>
        </h1>
        <NavBar />
        <section className="section">
            <span className="icon-text">
                <span className="icon has-text-danger">
                    <FontAwesomeIcon icon={faBan} />
                </span>
                <span>Could not find page. Please use navigation bar</span>
            </span>
        </section>
    </div>
};

export default ErrorPage;