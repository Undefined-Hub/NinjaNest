import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../CustomHook/useAuth";
import { MdDashboard } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { useDispatch } from 'react-redux';
import { logoutUser } from '../features/User/userSlice';
import pfp from '../assets/pfp.png'
import { toast } from 'react-hot-toast';

const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isNavMenuOpen, setIsNavMenuOpen] = React.useState(false);
    const handleNavMenuToggle = () => {
        setIsNavMenuOpen(!isNavMenuOpen);
    };
    const { isLoggedIn, user } = useAuth();
    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest(".relative")) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const excludedRoutes = ["/", "/add-property"];
    const currentPath = window.location.pathname;



    const newLocal = () => {
        if (excludedRoutes.includes(currentPath)) {
            return null;
        }
        return (
            <nav className="hidden md:flex space-x-8 text-[#727986] font-bold relative">
            {[
            { name: "Explore", path: "/explore" },
            { name: "Why NinjaNest?", path: "/why-ninjanest" },
            { name: "Support", path: "/support" },
            ].map((item) => (
            <li
            key={item.name}
            className={`list-none hover:cursor-pointer hover:text-tertiary-text relative ${
                currentPath === item.path ? "text-tertiary-text" : ""
            }`}
            onClick={() => navigate(item.path)}
            >
            {item.name}
            {currentPath === item.path && (
                <span className="absolute -bottom-6 left-0 right-0 h-[3px]   bg-gradient-to-r from-main-purple to-logo-blue"></span>
            )}
            </li>
            ))}
            </nav>
        );
        };
        const renderMenu = newLocal;

    const dispatch = useDispatch();

    const handleLogout = () => {
  // Set logout flag BEFORE dispatch
        sessionStorage.setItem("isLoggingOut", "true");

        dispatch(logoutUser());
       const toastId = toast.loading('Logging out...');
     
             setTimeout(() => {
                 toast.success('You’ve been logged out.', {
                     id: toastId,
                    //  icon: <FiLogOut className='text-red-500 font-bold text-lg' />,
                 });
             }, 200);

        // Delay navigation to allow PrivateRoute to check isLoggingOut
        setTimeout(() => {
            sessionStorage.removeItem("redirectAfterLogin");
            sessionStorage.removeItem("isLoggingOut");
            navigate('/');
        }, 100); // even 50ms might work, but 100ms is safer
        };


    return (
        <header className="bg-main-bg border-b border-secondary-text/30 flex justify-between items-center text-primary-text p-3 md:px-16 relative z-50">
            <div className="flex items-center justify-center gap-20">
            <p
                className="text-xl bg-gradient-to-r from-main-purple to-logo-blue bg-clip-text text-transparent font-bold hover:cursor-pointer"
                onClick={() => navigate("/")}
            >
                NinjaNest
            </p>
            {renderMenu()}
            </div>

      
            {isLoggedIn ? (
                <div className="relative">
                    <img
                           src={user?.user?.profilePicture||pfp}
                        alt="Profile"
                        className="w-12 h-12 rounded-full cursor-pointer object-cover"
                        onClick={handleMenuToggle}
                    />
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-72 pb-3 bg-sub-bg text-primary-text rounded-lg shadow-lg z-50">
                            <div className="flex items-center justify-start p-4 border-b border-gray-700">
                            <img
                                  src={user?.user?.profilePicture||pfp}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                                <div className="ml-3">
                                    <p className="font-bold">{user.user.name}</p>
                                    <p className="text-sm text-secondary-text">@{user.user.username}</p>
                                </div>
                            </div>
                            <button
                                className="flex items-center w-full px-4 py-2 text-left text-secondary-text hover:bg-menu-active-bg hover:text-tertiary-text"
                                onClick={() => navigate("/dashboard")}
                            >
                                <MdDashboard className="mr-2" />
                                Dashboard
                            </button>
                            <button
                                className="flex items-center w-full px-4 py-2 text-left text-secondary-text     hover:bg-logout-red hover:text-logout-text hover:opacity-90"
                                onClick={handleLogout}
                            >
                                <FiLogOut className="mr-2" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex gap-4 text-md">
                    <button
                        className="text-primary-text p-2 px-4 bg-sub-bg rounded-lg font-bold button-click"
                        onClick={() => navigate(`/auth?mode=signin`)}
                    >
                        Sign In
                    </button>
                    <button
                        className="text-primary-text p-2 px-4 bg-gradient-to-r from-main-purple to-logo-blue rounded-lg font-bold button-click"
                        onClick={() => navigate(`/auth?mode=signup`)}
                    >
                        Sign Up
                    </button>
                </div>
            )}
            <div className="md:hidden">
                <button className="text-primary-text p-2" onClick={handleNavMenuToggle}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                </button>
            </div>
            {isNavMenuOpen && (
                <nav className="md:hidden absolute top-16 left-0 w-full bg-main-bg text-secondary-text font-bold font-mono transition-transform transform duration-300 ease-in-out text-left z-50">
                    {[ "Explore", "Why NinjaNest?", "Support"].map((item) => (
                        <li
                            key={item}
                            className="list-none p-4 hover:bg-menu-active-bg m-4 rounded-lg"
                        >
                            {item}
                        </li>
                    ))}
                </nav>
            )}
        </header>
    );
};

export default Navbar;
