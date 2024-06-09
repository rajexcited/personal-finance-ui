import { FunctionComponent } from "react";
import { useAuth } from "../../../auth";



const HomePage: FunctionComponent = () => {
    const auth = useAuth();

    return (
        <section className="section is-narrow-y">
            {
                auth.userDetails.isAuthenticated &&
                <div className="columns">
                    <div className="column">
                        <h2 className="title">Welcome { auth.userDetails.fullName }</h2>
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
