import { FunctionComponent } from "react";
import { faDashboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Outlet } from "react-router-dom";
import NavBar from "./navbar";

const RootLayout: FunctionComponent = () => {
    return <div className="section">
        <h1 className="title is-1 has-text-centered">
            <span className="icon-text">
                <span className="icon">
                    <FontAwesomeIcon icon={faDashboard} />
                </span>
                <span>Dashboad</span>
            </span>
        </h1>
        <NavBar />
        <section className="section">
            <Outlet />
        </section>
    </div>
};

export default RootLayout;