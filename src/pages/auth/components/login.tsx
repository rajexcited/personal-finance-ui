import { FunctionComponent, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, LoadSpinner, Animated, InputValidateResponse } from "../../../components";
import ReactMarkdown from "react-markdown";
import useAuth from "../hooks/use-auth";
import { PAGE_URL } from "../../root";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSignIn, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import "./login.css";


const LoginPage: FunctionComponent = () => {
    const [emailId, setEmailId] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loginCompleted, setLoginCompleted] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate(location.state?.from?.pathname || "/");
        }
    }, []);

    useEffect(() => {
        if (!loginCompleted) return;
        setSubmitting(false);
        if (auth.isAuthenticated) {
            navigate(location.state?.from?.pathname || "/");
        } else {
            setErrorMessage("We are unable to logging you in. please try later in new browser window");
        }
    }, [auth.isAuthenticated, loginCompleted]);

    const onSubmitLoginHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        try {
            setSubmitting(true);
            await auth.login(emailId, password);
            navigate(location.state?.from?.pathname || "/");
        } catch (e) {
            const err = e as Error;
            setErrorMessage(err.message);
            setSubmitting(false);
        }
    };

    const onClickSignupHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        navigate(PAGE_URL.signupPage.fullUrl);
    };

    const passwordValidator = (value: string): InputValidateResponse => {
        const passwordRegex = /^(?=.*[\d])(?=.*[A-Z])(?=.*[!@#$%^&*])[\w!@#$%^&*\)\(\=]+$/;
        return { errorMessage: "password must contain a special character, number, UPPERCASE.", isValid: passwordRegex.test(value) };
    };

    return (
        <section className="login-section isPlaying">
            <LoadSpinner loading={ submitting } />

            { !!errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ !submitting } animatedIn="fadeInDown" animatedOut="fadeOutUp">
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
                            validate={ passwordValidator }
                            autocomplete="current-password"
                        />
                    </div>
                </div>
                <div className="p-5">&nbsp;</div>
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