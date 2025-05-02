// useAuth.js
import { useSelector } from "react-redux";

export const useAuth = () => {
    const { user } = useSelector((state) => state.user);
    const token = localStorage.getItem("token");
    // console.log("User from useAuth: ", user.user.username);
    // console.log("Token from useAuth: ", token);
    return {
        isLoggedIn: !!token && !!user?.user.username,
        user,
    };
};
export default useAuth;

