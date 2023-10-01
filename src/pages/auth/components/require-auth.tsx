import { useLocation, Navigate } from "react-router-dom";
import useAuth from "../hooks/use-auth";
import { FunctionComponent } from "react";


interface RequireAuthProps {
    children: JSX.Element;
}

const RequireAuth: FunctionComponent<RequireAuthProps> = ({ children }) => {
    const auth = useAuth();
    const location = useLocation();

    console.log("in requireAuth: ", auth, " location: ", location);

    return (
        auth.isAuthenticated ?
            children :
            <Navigate to="/login" state={ { from: location } } replace />
    );
};


export default RequireAuth;

