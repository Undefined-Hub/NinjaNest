import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../CustomHook/useAuth";

const PrivateRoute = ({ children }) => {
    const { isLoggedIn, isHydrated } = useAuth();
    const location = useLocation();

    if (!isHydrated) {
        // 👀 Wait for Redux to load auth state
        return <div>Loading...</div>; // or a proper spinner
    }
    if (!isLoggedIn) {
        const isLoggingOut = sessionStorage.getItem("isLoggingOut") === "true";
        
        if (!isLoggingOut && location.pathname !== "/auth") {
            sessionStorage.setItem("redirectAfterLogin", location.pathname);
        }

    // Cleanup the flag after it's used
    sessionStorage.removeItem("isLoggingOut");

    return <Navigate to="/auth" replace />;
    }

    return children;
};

export default PrivateRoute;
