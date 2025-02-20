import React from 'react'
import { useNavigate } from 'react-router-dom'
const Navbar = () => {
    const navigate = useNavigate();
    return (
        <header className="text-gray-600 body-font px-7 sticky top-0 z-50 backdrop-blur-lg bg-white/70">
            <div className="container mx-auto flex flex-wrap p-4 flex-col md:flex-row items-center">
                <a className="flex title-font font-medium items-center text-gray-900 md:mb-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <span onClick={() => navigate('/')} className="ml-3 text-xl cursor-pointer">NinjaNest</span>
                </a>
                <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
                    <a className="mr-5 hover:text-gray-900 hover:cursor-pointer" onClick={() => navigate('/')}>Home</a>
                    <a className="mr-5 hover:text-gray-900 hover:cursor-pointer" onClick={() => navigate('/')}>About</a>
                    <a className="mr-5 hover:text-gray-900 hover:cursor-pointer" onClick={() => navigate('/')}>Contact Us</a>
                    <a className="mr-5 hover:text-gray-900 hover:cursor-pointer" onClick={() => navigate('/auth')}>Login / Signup</a>
                </nav>
            </div>
        </header>
    )
}

export default Navbar
