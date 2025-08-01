import { FunctionComponent, useEffect, useState } from "react";
import useAuth from "../hooks/use-auth";
import { useLocation } from "react-router-dom";
import { testAttributes } from "../../../shared";


const LogoutPage: FunctionComponent = () => {
    const auth = useAuth();
    const [name, setName] = useState(auth.userDetails.fullName);
    const location = useLocation();

    useEffect(() => {
        if (name !== auth.userDetails.fullName) {
            setName(auth.userDetails.fullName);
        }
        auth.logout();
    }, []);

    return (
        <section className="section">
            <div className="columns is-centered">
                <div className="column is-two-thirds">
                    <article className="message is-link">
                        <div className="message-header" { ...testAttributes("logout-message-header") }>
                            <p>Bye, { name }!</p>
                        </div>
                        <div className="message-body" { ...testAttributes("logout-message") }>
                            {
                                location.state?.from?.idleTimeout &&
                                <p>Since there is no activity,</p>
                            }
                            <p>You have been logged out. See you soon</p>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default LogoutPage;
