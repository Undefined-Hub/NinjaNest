import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setHydrated, fetchUser } from "../features/User/userSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isHydrated } = useSelector((state) => state.user);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!isHydrated) {
      if (token) {
        dispatch(fetchUser(jwtDecode(token).id)); // Adjust ID extraction if needed
      } else {
        dispatch(setHydrated()); // No token → still mark as hydrated
      }
    }
  }, [isHydrated, token, dispatch]);

  const isTokenValid = () => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const isLoggedIn = !!token && !!user?.user?.username && isTokenValid();

  return { isLoggedIn, user, isHydrated };
};
