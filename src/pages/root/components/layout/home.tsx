import { FunctionComponent } from "react";
import { useAuth } from "../../../auth";
import _ from "lodash";


const HomePage: FunctionComponent = () => {
    const auth = useAuth();

    return (
        <section className="section is-narrow-y">
            {
                auth.isAuthenticated &&
                <div className="columns">
                    <div className="column">
                        <h2 className="title">Welcome, { _.capitalize(auth.fullName) }</h2>
                    </div>
                </div>
            }
            <div className="columns">
                <div className="column">
                    <div>Home Page</div>
                </div>
            </div>
        </section>
    );
};

export default HomePage;
