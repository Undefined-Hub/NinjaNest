import React from "react";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-[#111827] flex justify-between items-center text-white p-3 md:px-16">
            <div className="text-2xl bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] bg-clip-text text-transparent font-bold hover:cursor-pointer" onClick={() => navigate("/")}>
                NinjaNest
            </div>
            <nav className="hidden md:flex space-x-8 text-[#727986] font-bold">
                {["Home", "Search", "Features", "Contact"].map((item) => (
                    <li key={item} className="list-none hover:cursor-pointer hover:text-tertiary-text">
                        {item}
                    </li>
                ))}
            </nav>
            <div className="flex gap-4 text-md">
                <button className="text-[#fbfbfb] p-2 px-4 bg-[#18212f] rounded-lg font-bold button-click" onClick={() => navigate("/auth")}>
                    Sign In
                </button>
                <button className="text-[#fbfbfb] p-2 px-4 bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] rounded-lg font-bold button-click" onClick={() => navigate("/profile")}>
                    Sign Up
                </button>
            </div>
            <div className="md:hidden">
                <button className="text-[#fbfbfb] p-2" onClick={handleMenuToggle}>
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
            {isMenuOpen && (
                <nav className="md:hidden absolute top-16 left-0 w-full bg-[#111827] text-[#727986] font-bold font-mono transition-transform transform duration-300 ease-in-out text-left">
                    {["Home", "Search", "Features", "Contact"].map((item) => (
                        <li key={item} className="list-none p-4 hover:bg-[#1f2937] m-4 rounded-lg">
                            {item}
                        </li>
                    ))}
                </nav>
            )}
        </header>
    );
};

export default Navbar;
