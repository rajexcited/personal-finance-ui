import { FunctionComponent, useState, useEffect } from "react";
import AuthContext from "./auth-context";
import { AuthenticationService, SignupDetailType, UserDetailType } from "../services";
import dateutil from "date-and-time";
import { Animated } from "../../../components";
import ReactMarkdown from "react-markdown";


const authService = AuthenticationService();

interface AuthContextProviderProps {
    children: JSX.Element;
}

const defaultAuthState = () => ({ emailId: "", fullName: "", isAuthenticated: false, expiryDate: dateutil.parse("1/1", "M/D") });

enum ExpireStatus {
    Unknown = "status-unknown-expire",
    NotExpire = "status-not-expire",
    ExpiringSoon = "status-expiring-soon",
    Expired = "status-expired",
}

const AuthContextProvider: FunctionComponent<AuthContextProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<UserDetailType>(defaultAuthState());
    const [expiringStatus, setExpiringStatus] = useState(ExpireStatus.Unknown);

    useEffect(() => {
        const authStat = authService.getUserDetails();
        if (authStat.isAuthenticated) setAuthState(authStat);
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            console.debug("in interval after 1 sec", authState.isAuthenticated, expiringStatus, new Date());
            if (!authState.isAuthenticated && (expiringStatus === ExpireStatus.Expired || expiringStatus === ExpireStatus.Unknown)) {
                // public user or logged out user
                return;
            }
            // could be logged in user or about to logged out
            const authStat = authService.getUserDetails();
            // false auth state or logged in user or about to log out
            if (!authStat.isAuthenticated) {
                // update the current state
                if (authState.isAuthenticated) setAuthState(authStat);
                // logged out user, but false status. update status
                else setExpiringStatus(ExpireStatus.Expired);
            }
            console.debug(authState.isAuthenticated, authStat.isAuthenticated, expiringStatus);
            if (authStat.isAuthenticated) {
                const diffTime = dateutil.subtract(authStat?.expiryDate || authState.expiryDate, new Date());
                console.debug("is authenticated", diffTime.toSeconds());
                if (diffTime.toSeconds() - 30 <= 0) {
                    // about to expire scenario
                    if (expiringStatus !== ExpireStatus.ExpiringSoon) setExpiringStatus(ExpireStatus.ExpiringSoon);
                } else if (diffTime.toSeconds() > 0) {
                    if (expiringStatus !== ExpireStatus.NotExpire) setExpiringStatus(ExpireStatus.NotExpire);
                } else if (expiringStatus !== ExpireStatus.Expired) {
                    if (expiringStatus !== ExpireStatus.Unknown) {
                        //idle user
                        logout();
                    }
                    setExpiringStatus(ExpireStatus.Expired);
                }
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [authState, expiringStatus]);

    const login = async (emailId: string, password: string) => {
        await authService.login({ emailId, password });
        setAuthState(authService.getUserDetails());
    };

    const signup = async (details: SignupDetailType) => {
        await authService.signup({ ...details });
        setAuthState(authService.getUserDetails());
    };

    const logout = () => {
        authService.logout();
        setAuthState(defaultAuthState());
    };

    const onClickRefreshHandler: React.MouseEventHandler<HTMLAnchorElement> = async event => {
        event.preventDefault();
        event.stopPropagation();
        authService.ping();
    };

    return (
        <AuthContext.Provider value={
            {
                ...authState,
                login,
                logout,
                signup
            }
        }>
            <Animated animateOnMount={ false } isPlayIn={ expiringStatus === ExpireStatus.ExpiringSoon || expiringStatus === ExpireStatus.Expired } animatedIn="slideInDown" animatedOut="slideOutUp" isVisibleAfterAnimateOut={ false } >
                {
                    <div className="container mt-2 pt-2">
                        <div className="notification-container px-5 mx-5">
                            <div className="notification is-link is-light">
                                {
                                    expiringStatus === ExpireStatus.ExpiringSoon &&
                                    <p>Time is running out. <a onClick={ onClickRefreshHandler }>click to continue</a> </p>
                                }
                                {
                                    expiringStatus === ExpireStatus.Expired &&
                                    <ReactMarkdown children="You are logged out due to inactive" />
                                }
                            </div>
                        </div>
                    </div>
                }
            </Animated>

            {/* <Animated animateOnMount={ true } isPlayIn={ expiringStatus === ExpireStatus.Expired } animatedIn="slideInDown" animatedOut="slideOutUp">
                    <div className="container mt-2 pt-2">
                        <div className="notification-container px-5 mx-5">
                            <div className="notification is-link is-light">
                            </div>
                        </div>
                    </div>
                </Animated> */}

            { children }
        </AuthContext.Provider>
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