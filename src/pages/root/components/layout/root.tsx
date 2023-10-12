import "./root.css";
import { FunctionComponent } from "react";
import { Outlet, useNavigation } from "react-router-dom";
import { faDashboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavBar } from "../navigation";
import { LoadSpinner } from "../../../../components";


const RootLayout: FunctionComponent = () => {
    const navigation = useNavigation();
    const isLoading = navigation.state !== "idle";

    return (
        <div className="section">
            <h2 className="title is-2 has-text-centered">
                <span className="icon-text">
                    <span className="icon">
                        <FontAwesomeIcon icon={ faDashboard } />
                    </span>
                    <span>Dashboad</span>
                </span>
            </h2>
            <NavBar />
            <LoadSpinner loading={ isLoading } />
            <section className="root-route-child">
                <Outlet />
            </section>
        </div>
    );
};

export default RootLayout;