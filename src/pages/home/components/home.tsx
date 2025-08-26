import { FunctionComponent } from "react";
import { useAuth } from "../../auth";
import { StatsViewPage } from "./stats-view";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignIn, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { getFullPath } from "../../root";
import { useNavigate } from "react-router";
import { testAttributes } from "../../../shared";



export const HomePage: FunctionComponent = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    const onClickSignupHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        navigate(getFullPath("signupPage"));
    };
    const onClickLoginHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        navigate(getFullPath("loginPage"));
    };

    return (
        <section className="section is-narrow-y home-section">
            {
                auth.userDetails.isAuthenticated &&
                <>
                    <div className="columns">
                        <div className="column">
                            <h2 className="title">Welcome { auth.userDetails.fullName }</h2>
                        </div>
                    </div>
                    <StatsViewPage />
                </>
            }
            {
                !auth.userDetails.isAuthenticated &&
                <div className="container">
                    <div className="content">
                        <h2 className="subtitle">
                            Welcome to Personal Finance
                        </h2>
                        <p>
                            The personal finance tool is a comprehensive solution designed to help users manage their finances effectively. With features such as budget tracking, expense categorization, goal setting, and investment monitoring, this tool empowers users to make informed financial decisions and achieve their financial goals. By providing detailed insights into income, expenses, and investments, the tool simplifies the process of financial planning and enables users to prioritize their financial well-being. With its user-friendly interface and customizable options, the personal finance tool is an essential tool for individuals seeking to take control of their financial security and stability.
                        </p>
                    </div>
                    <div className="content"><p>&nbsp;</p></div>
                    <div className="columns is-display-mobile">
                        <div className="column">
                            <div className="buttons">
                                <button className="button is-dark is-large" type="button"
                                    onClick={ onClickSignupHandler } { ...testAttributes("signup-button-home") }>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={ faUserPlus } />
                                    </span>
                                    <span> Signup </span>
                                </button>
                            </div>
                        </div>
                        <div className="column">
                            <div className="buttons">
                                <button className="button is-dark is-large" type="button"
                                    onClick={ onClickLoginHandler } { ...testAttributes("login-button-home") }>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={ faSignIn } />
                                    </span>
                                    <span> Login </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </section>
    );
};

