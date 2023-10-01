import { FunctionComponent, useState, useEffect } from "react";
import AuthContext from "./auth-context";
import AuthenticationService, { UserDetailType } from "../services/auth-service";


const authService = AuthenticationService();

interface AuthContextProviderProps {
    children: JSX.Element;
}

const AuthContextProvider: FunctionComponent<AuthContextProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<UserDetailType>({ userName: "", fullName: "", isAuthenticated: false, expiryDate: new Date() });

    useEffect(() => {
        console.log("authState.expiryDate: ", authState.expiryDate);
        const authenticatedUserDetail = authService.getUserDetails();
        let timeoutId: NodeJS.Timer;
        if (authenticatedUserDetail && authenticatedUserDetail.expiryDate.getTime() > authState.expiryDate.getTime()) {
            console.log("got new expiry date", authenticatedUserDetail.expiryDate);
            setAuthState(authenticatedUserDetail);
            timeoutId = setTimeout(() => {
                // notify user or refresh the auth?
                console.log("authen is expiring in 30 secs. renew the token");
            }, authenticatedUserDetail.expiryDate.getTime() - new Date().getTime() - 30 * 1000);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [authState.expiryDate.getTime()]);

    const login = async (userName: string, password: string) => {
        await authService.login({ userName, password });
        setAuthState(authService.getUserDetails());
    };

    const logout = () => {
        authService.logout();
        setAuthState({
            userName: "",
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
                logout
            }
        }>
            { children }
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;
