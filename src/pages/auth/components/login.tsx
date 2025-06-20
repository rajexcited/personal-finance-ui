import { FunctionComponent, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, LoadSpinner, Animated, InputValidators, InputRef, ConfirmDialog } from "../../../components";
import ReactMarkdown from "react-markdown";
import useAuth from "../hooks/use-auth";
import { getFullPath } from "../../root";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSignIn, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { ConflictError, getLogger, testAttributes } from "../../../shared";


enum LoginSubmitStatus {
    NotStarted = "not-started",
    InProgress = "in-progress",
    CompletedSuccess = "success-response",
    CompletedError = "error-response"
}

const fcLogger = getLogger("FC.LoginPage", null, null, "DISABLED");

const LoginPage: FunctionComponent = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState(LoginSubmitStatus.NotStarted);
    const [existingSession, setExistingSession] = useState(false);
    const emailRef = useRef<InputRef>();
    const passwordRef = useRef<InputRef>();

    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        const logger = getLogger("useEffect.dep[auth.userDetails.isAuthenticated, submitStatus]", fcLogger);
        logger.debug("submitting =", submitStatus, ", auth.userDetails.isAuthenticated =", auth.userDetails.isAuthenticated);
        if (submitStatus === LoginSubmitStatus.InProgress) return;

        if (auth.userDetails.isAuthenticated) {
            navigate(location.state?.from?.pathname || "/");
        } else if (!errorMessage && submitStatus !== LoginSubmitStatus.NotStarted) {
            setErrorMessage("We are unable to logging you in. please try later in new browser window");
        }
    }, [auth.userDetails.isAuthenticated, submitStatus]);

    const loginHandler = async (forceLogin: boolean) => {
        try {
            setSubmitStatus(LoginSubmitStatus.InProgress);
            const emailId = emailRef.current?.getValue();
            const password = passwordRef.current?.getValue();
            if (!emailId) {
                throw new Error("emailId is not provided");
            }
            if (!password) {
                throw new Error("password is not provided");
            }
            await auth.login(emailId, password, forceLogin);
            setSubmitStatus(LoginSubmitStatus.CompletedSuccess);
        } catch (e) {
            const err = e as Error;
            setErrorMessage(err.message);
            setSubmitStatus(LoginSubmitStatus.CompletedError);
            if (e instanceof ConflictError) {
                return true;
            }
        }
        return false;
    };
    const onSubmitLoginHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        const hasConflictError = await loginHandler(false);
        if (hasConflictError) {
            setExistingSession(true);
        }
    };

    const onClickSignupHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setSubmitStatus(LoginSubmitStatus.NotStarted);
        navigate(getFullPath("signupPage"));
    };

    const cleanupExistingSessionHandler = () => {
        loginHandler(true);
    };

    const validatePassword = InputValidators.passwordValidator();

    return (
        <section className="login-section section is-px-0-mobile">
            <LoadSpinner loading={ submitStatus === LoginSubmitStatus.InProgress } id="login-inprogress" />

            <Animated animateOnMount={ true } isPlayIn={ submitStatus === LoginSubmitStatus.CompletedError } animatedIn="fadeInDown" animatedOut="fadeOutUp" isVisibleAfterAnimateOut={ false } scrollBeforePlayIn={ true }>
                <div className="columns is-centered" { ...testAttributes("login-error-message") }>
                    <div className="column is-half">
                        <article className="message is-danger mb-3">
                            <div className="message-body">
                                <ReactMarkdown children={ errorMessage } />
                            </div>
                        </article>
                    </div>
                </div>
            </Animated>

            <form onSubmit={ onSubmitLoginHandler }>
                <div className="columns is-centered">
                    <div className="column is-half">
                        <Input
                            id="emailId"
                            type="email"
                            label="Email Id "
                            placeholder="Enter Email id"
                            leftIcon={ faEnvelope }
                            initialValue={ "" }
                            maxlength={ 50 }
                            required={ true }
                            autocomplete="email"
                            ref={ emailRef }
                        />
                        <Input
                            id="password"
                            type="password"
                            label="Password "
                            placeholder="Enter password"
                            leftIcon={ faLock }
                            initialValue={ "" }
                            maxlength={ 25 }
                            minlength={ 8 }
                            required={ true }
                            validate={ validatePassword }
                            autocomplete="current-password"
                            ref={ passwordRef }
                        />
                    </div>
                </div>
                <div className="p-5"> </div>
                <div className="columns">
                    <div className="column">
                        <div className="buttons is-centered is-hidden-mobile">
                            <button className="button is-link is-medium" type="button" onClick={ onClickSignupHandler }
                                { ...testAttributes("signup-button") }>
                                <span className="icon">
                                    <FontAwesomeIcon icon={ faUserPlus } />
                                </span>
                                <span> Signup </span>
                            </button>
                        </div>
                    </div>
                    <div className="column">
                        <div className="buttons has-addons is-centered">
                            <button className="button is-dark is-medium" type="submit" { ...testAttributes("login-button") }>
                                <span className="icon">
                                    <FontAwesomeIcon icon={ faSignIn } />
                                </span>
                                <span> Login </span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <ConfirmDialog
                id="existing-session"
                onCancel={ () => { setExistingSession(false); } }
                onConfirm={ cleanupExistingSessionHandler }
                open={ existingSession }
                title="Another Active Session Found"
                yesButtonContent="Punch Login"
                content={
                    <div>
                        <p className="is-danger"> { errorMessage } </p>
                        <p className="content">Do you wish to kickout other session and login ? </p>
                    </div>
                }

            />
        </section>
    );
};


export default LoginPage;