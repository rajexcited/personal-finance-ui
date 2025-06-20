import { FunctionComponent, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import AuthContext, { dummyUserDetails } from "./auth-context";
import { authService, UserDetailsResource, UserSignupResource } from "../services";
import { Anchor, Animated } from "../../../components";
import { ObjectDeepDifference, getLogger, testAttributes } from "../../../shared";
import { useLocation } from "react-router-dom";



interface AuthContextProviderProps {
    children: JSX.Element;
}

enum ExpireStatus {
    Unknown = "status-unknown-expire",
    NotExpire = "status-not-expire",
    ExpiringSoon = "status-expiring-soon",
    Expired = "status-expired",
}

const ONE_SECOND_IN_MILLI = 1000;
const NOTIFY_USER_REFRESH_LOGIN_SESSION = 60;

const fcLogger = getLogger("FC.AuthContextProvider", null, null, "DISABLED");

const AuthContextProvider: FunctionComponent<AuthContextProviderProps> = ({ children }) => {

    const [userDetails, setUserDetails] = useState<UserDetailsResource>({ ...dummyUserDetails });
    const [expiringStatus, setExpiringStatus] = useState(ExpireStatus.Unknown);
    const [isUserAccountReadOnly, setUserAccountReadOnly] = useState(false);

    // first time - when component initilizes
    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);
        const userDetailsPromise = authService.getUserDetails();
        userDetailsPromise.then(userDetails => {
            logger.debug("received userDetail =", userDetails, "setting to context if not null");
            if (userDetails.isAuthenticated) setUserDetails({ ...userDetails });
            authService.isUserAccountReadOnly().then(setUserAccountReadOnly);
        });
    }, []);

    useEffect(() => {
        const _logger = getLogger("useEffect.dep[userDetails, expiringStatus]", fcLogger);
        let intervalId: NodeJS.Timer | undefined = undefined;

        const setAuthenExpire = () => {
            const logger = getLogger("setAuthenExpire", _logger);
            const diffUserDetails = ObjectDeepDifference({ ...userDetails }, { ...dummyUserDetails });
            if (Object.keys(diffUserDetails).length > 0) {
                logger.debug("updating context to dummy user");
                setUserDetails({ ...dummyUserDetails });
            }
            if (expiringStatus !== ExpireStatus.Expired && expiringStatus !== ExpireStatus.Unknown) {
                logger.debug("updating context to expired status");
                setExpiringStatus(ExpireStatus.Expired);
            }
        };

        const setAuthenNotExpired = async () => {
            const logger = getLogger("setAuthenNotExpired", _logger);
            if (!userDetails.isAuthenticated) {
                logger.debug("authen is false, so calling api and updating context user details");
                const userDetails = await authService.getUserDetails();
                setUserDetails({ ...userDetails });
            }
            if (expiringStatus === ExpireStatus.Expired || expiringStatus === ExpireStatus.Unknown) {
                logger.debug("updating context to not expired indicating user logged in");
                setExpiringStatus(ExpireStatus.NotExpire);
            }
        };

        const setAboutToExpire = () => {
            const logger = getLogger("setAboutToExpire", _logger);
            const remainingExpiryTimeInSec = authService.getTokenExpiryTime();
            // logger.debug("remainingExpiryTimeInSec =", remainingExpiryTimeInSec);
            if (remainingExpiryTimeInSec <= NOTIFY_USER_REFRESH_LOGIN_SESSION) {
                logger.debug("updating context to expiring soon status");
                setExpiringStatus(ExpireStatus.ExpiringSoon);
            } else if (expiringStatus === ExpireStatus.ExpiringSoon) {
                setExpiringStatus(ExpireStatus.NotExpire);
            }
        };

        if (!userDetails.isAuthenticated) {
            // scenario 1 - page load / public user - do nothing
            // scenario 2 - logout user - make sure to have correct userDetails and status
            _logger.debug("user not authenticated. indicating scenario 1 (page load / public user) & 2 (logged out user) ");
            setAuthenExpire();
        } else {
            // scenario 3 user signup   - configures interval check to run on every seconds. check authen session from service and update status
            // scenario 4 user login   - same as signup
            // scenario 5 session about to expire
            // scenario 6 session is refreshed
            // scenario 7 session is about to expire
            intervalId = setInterval(async () => {
                const startTime = Date.now();
                const logger = getLogger("authenticated.setInterval", _logger);
                logger.debug("periodic execution. verify and update context");
                if (authService.isAuthenticated(logger)) {
                    logger.debug("authen true from session/api. so update the context if required");
                    await setAuthenNotExpired();
                    setAboutToExpire();
                    authService.isUserAccountReadOnly().then(setUserAccountReadOnly);
                } else {
                    logger.debug("authen false from session/api. so update the context if required");
                    setAuthenExpire();
                }
                logger.debug("execution time for interval function is ", (Date.now() - startTime), " ms");
            }, ONE_SECOND_IN_MILLI);
        }

        return () => {
            _logger.debug("clearing old interval. will be configuring new interval in new use effect function call");
            clearInterval(intervalId);
        };

    }, [userDetails, expiringStatus, setUserDetails, setExpiringStatus]);

    const validateExpiryStatusOnLocationChange = () => {
        // whenever path changes by user, change status if applicable to remove banner
        setExpiringStatus(prev => {
            if (prev === ExpireStatus.Expired) {
                return ExpireStatus.Unknown;
            }
            return prev;
        });
    };

    const login = async (emailId: string, password: string, forceLogin: boolean) => {
        const logger = getLogger("login", fcLogger);
        await authService.login({ emailId, password }, forceLogin);
        logger.debug("after login api success, calling user details get api call");
        const userDetails = await authService.getUserDetails();
        logger.debug("updating context with logged in user session data");
        setUserDetails({ ...userDetails });
        setExpiringStatus(ExpireStatus.NotExpire);
    };

    const signup = async (details: UserSignupResource) => {
        const logger = getLogger("signup", fcLogger);
        await authService.signup({ ...details });
        logger.debug("after signup api success, calling user details get api call");
        const userDetails = await authService.getUserDetails();
        logger.debug("updating context with logged in user session data");
        setUserDetails({ ...userDetails });
        setExpiringStatus(ExpireStatus.NotExpire);
    };

    const logout = async () => {
        const logger = getLogger("logout", fcLogger);
        await authService.logout();
        logger.debug("after logout api success, updating context with dummy user data and expired status");
        setUserDetails({ ...dummyUserDetails });
        setExpiringStatus(ExpireStatus.Expired);
    };

    const onClickRefreshHandler: React.MouseEventHandler<HTMLAnchorElement> = async event => {
        event.preventDefault();
        event.stopPropagation();
        const logger = getLogger("onClickRefreshHandler", fcLogger);
        await authService.refreshToken();
        logger.debug("auth refresh api call is successful.");
    };

    return (
        <AuthContext.Provider value={
            {
                userDetails,
                readOnly: isUserAccountReadOnly,
                login,
                logout,
                signup,
                validateExpiryStatusOnLocationChange
            }
        }>
            <Animated animateOnMount={ false } isPlayIn={ expiringStatus === ExpireStatus.ExpiringSoon || expiringStatus === ExpireStatus.Expired } animatedIn="slideInDown" animatedOut="slideOutUp" isVisibleAfterAnimateOut={ false } >
                {
                    <div className="container mt-2 pt-2">
                        <div className="notification-container px-5 mx-5">
                            <div className="notification is-link is-light" { ...testAttributes("expire-status-msg") }>
                                {
                                    expiringStatus === ExpireStatus.ExpiringSoon &&
                                    <p>Time is running out. <Anchor onClick={ onClickRefreshHandler }>click to continue</Anchor> </p>
                                }
                                {
                                    expiringStatus === ExpireStatus.Expired &&
                                    <ReactMarkdown children="You are logged out" />
                                }
                                {
                                    expiringStatus !== ExpireStatus.ExpiringSoon && expiringStatus !== ExpireStatus.Expired &&
                                    <p>&nbsp;&nbsp;&nbsp;</p>
                                }
                            </div>
                        </div>
                    </div>
                }
            </Animated>

            { children }
        </AuthContext.Provider >
    );
};

export default AuthContextProvider;




/**
 * 
 * load page - auth state - unknown
 * login - auth state - not expired
 * timeout_30 - auth state - expiring soon
 * timeout - auth state - expired
 * 
 * 
 * expiring soon - allow to refresh auth state
 * 
 * 
 */