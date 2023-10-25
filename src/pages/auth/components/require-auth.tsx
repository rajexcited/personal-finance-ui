import { FunctionComponent } from "react";
import { useLocation, Navigate } from "react-router-dom";
import useAuth from "../hooks/use-auth";


interface RequireAuthProps {
    children: JSX.Element;
}

const RequireAuth: FunctionComponent<RequireAuthProps> = ({ children }) => {
    const auth = useAuth();
    const location = useLocation();

    return (
        auth.isAuthenticated ?
            children :
            <Navigate to="/login" state={ { from: location } } replace />
    );
};


export default RequireAuth;

