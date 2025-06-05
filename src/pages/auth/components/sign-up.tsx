import { FunctionComponent, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { faEnvelope, faLock, faSignIn, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactMarkdown from "react-markdown";
import { Animated, DropDown, DropDownItemType, Input, InputValidateResponse, InputValidators, LoadSpinner } from "../../../components";
import useAuth from "../hooks/use-auth";
import { RouteHandlerResponse, testAttributes } from "../../../shared";
import { SignupDetailsLoaderResource } from "../route-handlers/signup-loader";
import { getFullPath } from "../../root";


const SignupPage: FunctionComponent = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailId, setEmailId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<DropDownItemType>();
    const [countries, setCountries] = useState<DropDownItemType[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [signupComplete, setSignupComplete] = useState(false);
    const loaderData = useLoaderData() as RouteHandlerResponse<SignupDetailsLoaderResource, null>;

    const navigate = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        if (auth.userDetails.isAuthenticated) {
            setErrorMessage("You are already logged in, so cannot sing up");
        }
    }, []);

    useEffect(() => {
        if (loaderData.data) {
            const ddCountryList: DropDownItemType[] = loaderData.data.countryList.map(cntry => ({ id: cntry.code, content: cntry.name }));
            setCountries(ddCountryList);
            setSelectedCountry(prev => prev || ddCountryList[0]);
        }
    }, [loaderData]);

    useEffect(() => {
        if (!signupComplete) return;
        setSubmitting(false);
        if (auth.userDetails.isAuthenticated) {
            setErrorMessage("");
            navigate("/");
        } else {
            setErrorMessage("We are unable to signing you up. Please try again.");
        }
    }, [auth.userDetails.isAuthenticated, signupComplete, navigate]);

    const onSubmitSignupHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        if (auth.userDetails.isAuthenticated) return;
        try {
            setSubmitting(true);
            await auth.signup({
                firstName,
                lastName,
                emailId,
                password,
                countryCode: selectedCountry?.id as string
            });
            setSignupComplete(true);
        } catch (e) {
            const err = e as Error;
            setErrorMessage(err.message);
            setSubmitting(false);
        }
    };

    const validatePassword = InputValidators.passwordValidator();
    const validatePasswordRepeat = (value: string): InputValidateResponse => {
        return {
            isValid: password === value,
            errorMessage: "re-entered password is not matching",
        };
    };

    const onClickLoginHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        navigate(getFullPath("signupPage"));
    };

    return (
        <section className="section is-px-0-mobile">
            <LoadSpinner loading={ submitting } />

            {
                !!errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ !submitting }
                    animatedIn="fadeInDown" animatedOut="fadeOutUp"
                    isVisibleAfterAnimateOut={ false } scrollBeforePlayIn={ true }>
                    <div className="columns is-centered" { ...testAttributes("signup-error") }>
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
                                    id="firstName"
                                    type="text"
                                    label="First Name "
                                    placeholder="Enter First Name"
                                    initialValue={ firstName }
                                    onChange={ setFirstName }
                                    maxlength={ 25 }
                                    required={ true }
                                    pattern="[\w\s]+"
                                    disabled={ auth.userDetails.isAuthenticated }
                                    autocomplete="given-name"
                                />
                            </div>
                            <div className="column">
                                <Input
                                    id="lastName"
                                    type="text"
                                    label="Last Name "
                                    placeholder="Enter Last Name"
                                    initialValue={ lastName }
                                    onChange={ setLastName }
                                    maxlength={ 25 }
                                    required={ true }
                                    pattern="[\w\s]+"
                                    disabled={ auth.userDetails.isAuthenticated }
                                    autocomplete="family-name"
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
                                    disabled={ auth.userDetails.isAuthenticated }
                                    autocomplete="email"
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
                                    disabled={ auth.userDetails.isAuthenticated }
                                    autocomplete="new-password"
                                />
                                <Input
                                    id="passwordRepeat"
                                    type="password"
                                    label="Re-type Password "
                                    placeholder="Re type password"
                                    leftIcon={ faLock }
                                    initialValue={ passwordRepeat }
                                    onChange={ setPasswordRepeat }
                                    maxlength={ 25 }
                                    minlength={ 8 }
                                    required={ true }
                                    validate={ validatePasswordRepeat }
                                    disabled={ auth.userDetails.isAuthenticated }
                                    autocomplete="new-password"
                                />
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <DropDown
                                    id="countryCode"
                                    key={ "countryCode" }
                                    label="Country: "
                                    items={ countries }
                                    onSelect={ (country: DropDownItemType) => setSelectedCountry(country) }
                                    selectedItem={ selectedCountry }
                                    required={ true }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-5"></div>
                <div className="columns">
                    <div className="column">
                        <div className="buttons has-addons is-centered">
                            <button className="button is-link is-medium" type="button" onClick={ onClickLoginHandler }
                                { ...testAttributes("login-button") } >
                                <span className="icon">
                                    <FontAwesomeIcon icon={ faSignIn } />
                                </span>
                                <span> Login </span>
                            </button>
                        </div>
                    </div>
                    <div className="column">
                        <div className="buttons has-addons is-centered">
                            <button className="button is-dark is-medium" type="submit" { ...testAttributes("signup-button") }>
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