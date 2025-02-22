import React from "react";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
return (
    <header className="bg-[#111827] flex justify-between items-center text-white p-3">
        <div className="text-2xl bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] bg-clip-text text-transparent font-bold">NinjaNest</div>
        <nav className="flex space-x-4 text-[#727986] font-bold font-mono">
            {['Home', 'Search', 'Features', 'Contact'].map((item) => (
                <li key={item} className="list-none">{item}</li>
            ))}
        </nav>
        <div className="flex gap-4 text-md">
            <button className="text-[#fbfbfb] p-2 px-4 bg-[#18212f] rounded-lg font-bold">Sign In</button>
            <button className="text-[#fbfbfb] p-2 px-4 bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] rounded-lg font-bold">Sign Up</button>
        </div>
    </header>
);
};

export default Navbar;
