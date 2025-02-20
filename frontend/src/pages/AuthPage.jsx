import React, { useState, useEffect } from 'react';
import google from '../assets/google.svg';
import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const AuthPage = () => {
    const [auth, setAuth] = useState(true);
    const [signupData, setSignupData] = useState({ fullName: '', username: '', email: '', password: '' });
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSignupChange = (e) => {
        setSignupData({ ...signupData, [e.target.name]: e.target.value });
    };

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (auth) {
            console.log('Login Data:', loginData);
            try {
                const response = await axios.post(`${SERVER_URL}/auth/login`, {
                    email: loginData.email,
                    password: loginData.password,
                });
                console.log('Login Response:', response.data);
            } catch (error) {
                console.error('Error logging in NinjaNest:', error);
            }
        } else {
            console.log('Signup Data:', signupData);
            try {
                const response = await axios.post(`${SERVER_URL}/auth/register`, {
                    name: signupData.fullName,
                    username: signupData.username,
                    email: signupData.email,
                    password: signupData.password,
                });
                console.log('Signup Response:', response.data);
            } catch (error) {
                console.error('Error signing in NinjaNest:', error);
            }
        }
    };

    return (
        <div className="bg-gray-100 h-screen flex justify-center items-center space-x-2">
            <div className="flex place-content-evenly border border-gray-300 bg-white rounded-xl shadow-md w-full max-w-2xl min-h-[500px] p-8">
                {!auth && (
                    <div className="flex flex-col justify-center items-center w-full md:w-1/2">
                        <form className="flex flex-col space-y-5 w-full" onSubmit={handleSubmit}>
                            <p className="text-2xl font-bold text-center">Sign Up</p>
                            <div className="flex items-center justify-center w-full border-2 rounded-full p-2 hover:shadow-lg transition-all duration-200 delay-100 cursor-pointer">
                                <img src={google} alt="Google" className="w-6 h-6 mr-2" />
                                <span className="text-sm font-semibold">Sign up with Google</span>
                            </div>
                            <p className="font-light text-sm text-center cursor-default">or create your account</p>
                            <input type="text" name="fullName" value={signupData.fullName} onChange={handleSignupChange} className="p-3 bg-[#eee] rounded-lg w-full focus:outline-none" placeholder="Full Name" required />
                            <input type="text" name="username" value={signupData.username} onChange={handleSignupChange} className="p-3 bg-[#eee] rounded-lg w-full focus:outline-none" placeholder="Username" />
                            <input type="email" name="email" value={signupData.email} onChange={handleSignupChange} className="p-3 bg-[#eee] rounded-lg w-full focus:outline-none" placeholder="Email" required />
                            <input type="password" name="password" value={signupData.password} onChange={handleSignupChange} className="p-3 bg-[#eee] rounded-lg w-full focus:outline-none" placeholder="Password" required />
                            <p className="text-sm text-center cursor-pointer" onClick={() => setAuth(!auth)}>Already have an account?</p>
                            <div className="flex justify-center items-center">
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 transition duration-300 text-white py-2 px-8 rounded-full uppercase font-semibold w-1/2 active:scale-90 ease-in-out">Sign Up</button>
                            </div>
                        </form>
                    </div>
                )}
                {auth && (
                    <div className="flex flex-col justify-center items-center w-full md:w-1/2">
                        <form className="flex flex-col space-y-5 w-full" onSubmit={handleSubmit}>
                            <p className="text-2xl font-bold text-center">Log In</p>
                            <div className="flex items-center justify-center w-full border-2 rounded-full p-2 hover:shadow-lg transition-all duration-200 delay-100 cursor-pointer">
                                <img src={google} alt="Google" className="w-6 h-6 mr-2" />
                                <span className="text-sm font-semibold">Log in with Google</span>
                            </div>
                            <p className="font-light text-sm text-center cursor-default">or use your email</p>
                            <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} className="p-3 bg-[#eee] rounded-lg w-full focus:outline-none" placeholder="Email" required />
                            <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} className="p-3 bg-[#eee] rounded-lg w-full focus:outline-none" placeholder="Password" required />
                            <p className="text-sm text-center cursor-pointer" onClick={() => setAuth(!auth)}>Don't have an account?</p>
                            <div className="flex justify-center items-center">
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 transition duration-300 text-white py-2 px-8 rounded-full uppercase font-semibold w-1/2 active:scale-90 ease-in-out">Log In</button>
                            </div>
                        </form>
                    </div>
                )}
                <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-white-100 p-8 rounded-md">
                    <p className="text-2xl font-bold text-center">Welcome to NinjaNest!</p>
                    <p className="text-sm text-center mt-4">Find your perfect student rental home today.</p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
