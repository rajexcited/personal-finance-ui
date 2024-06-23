import { FunctionComponent, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, LoadSpinner, Animated, InputValidators } from "../../../components";
import ReactMarkdown from "react-markdown";
import useAuth from "../hooks/use-auth";
import { PAGE_URL } from "../../root";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSignIn, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import "./login.css";
import { getLogger } from "../../../services";

enum LoginSubmitStatus {
    NotStarted = "not-started",
    InProgress = "in-progress",
    CompletedSuccess = "success-response",
    CompletedError = "error-response"
}

const LoginPage: FunctionComponent = () => {
    const [emailId, setEmailId] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState(LoginSubmitStatus.NotStarted);

    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        const logger = getLogger("FC.loginPage.useEffect.dep[auth.userDetails.isAuthenticated, loginCompleted]");
        logger.debug("submitting =", submitStatus, ", auth.userDetails.isAuthenticated =", auth.userDetails.isAuthenticated);
        if (submitStatus === LoginSubmitStatus.InProgress) return;

        if (auth.userDetails.isAuthenticated) {
            navigate(location.state?.from?.pathname || "/");
        } else if (!errorMessage && submitStatus !== LoginSubmitStatus.NotStarted) {
            setErrorMessage("We are unable to logging you in. please try later in new browser window");
        }
    }, [auth.userDetails.isAuthenticated, submitStatus]);

    const onSubmitLoginHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        try {
            setSubmitStatus(LoginSubmitStatus.InProgress);
            await auth.login(emailId, password);
            setSubmitStatus(LoginSubmitStatus.CompletedSuccess);
        } catch (e) {
            const err = e as Error;
            setErrorMessage(err.message);
            setSubmitStatus(LoginSubmitStatus.CompletedError);
        }
    };

    const onClickSignupHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setSubmitStatus(LoginSubmitStatus.NotStarted);
        navigate(PAGE_URL.signupPage.fullUrl);
    };

    const validatePassword = InputValidators.passwordValidator();

    return (
        <section className="login-section">
            <LoadSpinner loading={ submitStatus === LoginSubmitStatus.InProgress } />

            { !!errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ submitStatus === LoginSubmitStatus.CompletedError } animatedIn="fadeInDown" animatedOut="fadeOutUp" isVisibleAfterAnimateOut={ false } >
                    <div className="columns is-centered">
                        <div className="column is-half">
                            <article className="message is-danger mb-3">
                                <div className="message-body">
                                    <ReactMarkdown children={ errorMessage } />
                                </div>
                            </article>
                        </div>
                    </div>
                </Animated>
            }

            <form onSubmit={ onSubmitLoginHandler }>
                <div className="columns is-centered">
                    <div className="column is-half">
                        <Input
                            id="emailId"
                            type="email"
                            label="Email Id "
                            placeholder="Enter Email id"
                            leftIcon={ faEnvelope }
                            initialValue={ emailId }
                            onChange={ setEmailId }
                            maxlength={ 50 }
                            required={ true }
                            autocomplete="username"
                        />
                        <Input
                            id="password"
                            type="password"
                            label="Password "
                            placeholder="Enter password"
                            leftIcon={ faLock }
                            initialValue={ password }
                            onChange={ setPassword }
                            maxlength={ 25 }
                            minlength={ 8 }
                            required={ true }
                            validate={ validatePassword }
                            autocomplete="current-password"
                        />
                    </div>
                </div>
                <div className="p-5"> </div>
                <div className="columns">
                    <div className="column">
                        <div className="buttons is-centered">
                            <button className="button is-link is-medium" type="button" onClick={ onClickSignupHandler }>
                                <span className="icon">
                                    <FontAwesomeIcon icon={ faUserPlus } />
                                </span>
                                <span> Signup </span>
                            </button>
                        </div>
                    </div>
                    <div className="column">
                        <div className="buttons has-addons is-centered">
                            <button className="button is-dark is-medium" type="submit">
                                <span className="icon">
                                    <FontAwesomeIcon icon={ faSignIn } />
                                </span>
                                <span> Login </span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
};


export default LoginPage;