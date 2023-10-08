import { FunctionComponent, useEffect, useState } from "react";
import useAuth from "../hooks/use-auth";


const LogoutPage: FunctionComponent = () => {
    const auth = useAuth();
    const [name, setName] = useState(auth.fullName || "");

    useEffect(() => {
        if (name !== auth.fullName) {
            setName(auth.fullName);
        }
        auth.logout();
    }, []);

    return (
        <section className="section">
            <div className="columns is-centered">
                <div className="column is-two-thirds">
                    <article className="message is-link">
                        <div className="message-header">
                            <p>Bye, { name }!</p>
                        </div>
                        <div className="message-body">
                            <p>You have been logged out. See you soon</p>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default LogoutPage;
