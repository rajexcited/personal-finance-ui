import { FunctionComponent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { faEnvelope, faLock, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactMarkdown from "react-markdown";
import { Animated, Input, InputValidateResponse, InputValidators, LoadSpinner } from "../../../components";
import useAuth from "../hooks/use-auth";


const SignupPage: FunctionComponent = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailId, setEmailId] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [signupComplete, setSignupComplete] = useState(false);

    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        if (auth.isAuthenticated) {
            setErrorMessage("You are already logged in, so cannot sing up");
        }
    }, []);

    useEffect(() => {
        if (!signupComplete) return;
        setSubmitting(false);
        if (auth.isAuthenticated) {
            setErrorMessage("");
            navigate("/");
        } else {
            setErrorMessage("We are unable to signing you up. Please try again.");
        }
    }, [auth.isAuthenticated, signupComplete]);

    const onSubmitSignupHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        if (auth.isAuthenticated) return;
        try {
            setSubmitting(true);
            await auth.signup({
                firstName,
                lastName,
                emailId,
                password,
            });
            setSignupComplete(true);
        } catch (e) {
            const err = e as Error;
            setErrorMessage(err.message);
            setSubmitting(false);
        }
    };

    const validatePassword = InputValidators.passwordValidator();


    return (
        <section className="section">
            <LoadSpinner loading={ submitting } />

            {
                !!errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ !submitting } animatedIn="fadeInDown" animatedOut="fadeOutUp" isVisibleAfterAnimateOut={ false } >
                    <div className="columns is-centered">
                        <div className="column is-half">
                            <article className="message is-danger mb-5">
                                <div className="message-body">
                                    <ReactMarkdown children={ errorMessage } />
                                </div>
                            </article>
                        </div>
                    </div>
                </Animated>
            }

            <form onSubmit={ onSubmitSignupHandler }>
                <div className="columns is-centered">
                    <div className="column is-half">
                        <div className="columns">
                            <div className="column">
                                <Input
                                    id="firstname"
                                    type="text"
                                    label="First Name "
                                    placeholder="Enter First Name"
                                    initialValue={ firstName }
                                    onChange={ setFirstName }
                                    maxlength={ 25 }
                                    required={ true }
                                    pattern="[\w\s]+"
                                    disabled={ auth.isAuthenticated }
                                />
                            </div>
                            <div className="column">
                                <Input
                                    id="lastname"
                                    type="text"
                                    label="Last Name "
                                    placeholder="Enter Last Name"
                                    initialValue={ lastName }
                                    onChange={ setLastName }
                                    maxlength={ 25 }
                                    required={ true }
                                    pattern="[\w\s]+"
                                    disabled={ auth.isAuthenticated }
                                />
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
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
                                    disabled={ auth.isAuthenticated }
                                    autocomplete="new-username"
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
                                    disabled={ auth.isAuthenticated }
                                    autocomplete="new-password"
                                />
                            </div>
                        </div>

                    </div>
                </div>
                <div className="p-5">&nbsp;</div>
                <div className="columns">
                    <div className="column">&nbsp;</div>
                    <div className="column">
                        <div className="buttons has-addons is-centered">
                            <button className="button is-dark is-medium" type="submit">
                                <span className="icon">
                                    <FontAwesomeIcon icon={ faUserPlus } />
                                </span>
                                <span> Sign up </span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
};

export default SignupPage;