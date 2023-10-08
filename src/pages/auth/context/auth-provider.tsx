import { FunctionComponent, useState, useEffect } from "react";
import AuthContext from "./auth-context";
import AuthenticationService, { SignupDetailType, UserDetailType } from "../services/auth-service";


const authService = AuthenticationService();

interface AuthContextProviderProps {
    children: JSX.Element;
}

const AuthContextProvider: FunctionComponent<AuthContextProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<UserDetailType>({ emailId: "", fullName: "", isAuthenticated: false, expiryDate: new Date() });
    const [expiringStatus, setExpiringStatus] = useState('');

    useEffect(() => {
        const authenticatedUserDetail = authService.getUserDetails();
        let timeoutId: NodeJS.Timer;
        if (authenticatedUserDetail && authenticatedUserDetail.expiryDate.getTime() > authState.expiryDate.getTime()) {
            setAuthState(authenticatedUserDetail);
            console.debug("timeout seconds ", authenticatedUserDetail.expiryDate.getTime() - new Date().getTime() - 30 * 1000);
            timeoutId = setTimeout(() => {
                // notify user or refresh the auth?
                console.debug("authen is expiring in 30 secs. renew the token");
                setExpiringStatus("expiring-soon");
            }, authenticatedUserDetail.expiryDate.getTime() - new Date().getTime() - 30 * 1000);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [authState.expiryDate.getTime()]);

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
        setAuthState({
            emailId: "",
            fullName: "",
            isAuthenticated: false,
            expiryDate: new Date()
        });
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
            {
                expiringStatus === "expiring-soon" &&
                <div className="container mt-2 pt-2">
                    <div className="notification-container px-5 mx-5">
                        <div className="notification is-link is-light">
                            <p>Time is running out. click to continue</p>
                        </div>
                    </div>
                </div>
            }
            { children }
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;
