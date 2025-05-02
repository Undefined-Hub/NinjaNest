import React, { useState, useEffect } from 'react';
import google from '../assets/google.svg';
import axios from 'axios';
import { fetchUser } from '../features/User/userSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const AuthPage = () => {
    const [auth, setAuth] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        return mode === 'signin' ? true : mode === 'signup' ? false : true;
    });
    const [signupData, setSignupData] = useState({ fullName: '', username: '', email: '', password: '' });
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, loading, error } = useSelector((state) => state.user);

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
            try {
                const response = await axios.post(`${SERVER_URL}/auth/login`, loginData);
                alert('Logged in successfully');
                localStorage.setItem('token', response.data.accessToken);
                if (error) console.log('Error fetching user details :- ' + error);
                dispatch(fetchUser(response.data.user.username));
                navigate('/dashboard');
            } catch (error) {
                alert('Error logging in NinjaNest!... Please try again!');
                console.error('Error logging in NinjaNest:', error);
            }
        } else {
            try {
                const response = await axios.post(`${SERVER_URL}/auth/register`, {
                    name: signupData.fullName,
                    username: signupData.username,
                    email: signupData.email,
                    password: signupData.password,
                });
                alert('Account created successfully! Please log in.');
                setAuth(true);
            } catch (error) {
                console.error('Error signing up to NinjaNest:', error);
            }
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-main-bg px-4">
            <div className="flex flex-col md:flex-row border border-gray-600 bg-sub-bg rounded-xl shadow-xl w-full max-w-3xl min-h-[500px] overflow-hidden">
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <form className="flex flex-col space-y-5" onSubmit={handleSubmit}>
                        <p className="text-2xl font-bold text-primary-text text-center">{auth ? 'Log In' : 'Sign Up'}</p>
                        <div className="flex items-center justify-center w-full border border-gray-500 bg-cards-bg rounded-full p-2 hover:shadow-lg transition duration-200 cursor-pointer">
                            <img src={google} alt="Google" className="w-6 h-6 mr-2" />
                            <span className="text-sm font-semibold text-primary-text">{auth ? 'Log in with Google' : 'Sign up with Google'}</span>
                        </div>
                        <p className="text-secondary-text text-sm text-center">or use your email</p>

                        {!auth ? (
                            <>
                                <input type="text" name="fullName" value={signupData.fullName} onChange={handleSignupChange} className="p-3 bg-cards-bg text-primary-text rounded-lg w-full focus:outline-none" placeholder="Full Name" required />
                                <input type="text" name="username" value={signupData.username} onChange={handleSignupChange} className="p-3 bg-cards-bg text-primary-text rounded-lg w-full focus:outline-none" placeholder="Username" required />
                                <input type="email" name="email" value={signupData.email} onChange={handleSignupChange} className="p-3 bg-cards-bg text-primary-text rounded-lg w-full focus:outline-none" placeholder="Email" required />
                                <input type="password" name="password" value={signupData.password} onChange={handleSignupChange} className="p-3 bg-cards-bg text-primary-text rounded-lg w-full focus:outline-none" placeholder="Password" required />
                            </>
                        ) : (
                            <>
                                <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} className="p-3 bg-cards-bg text-primary-text rounded-lg w-full focus:outline-none" placeholder="Email" required />
                                <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} className="p-3 bg-cards-bg text-primary-text rounded-lg w-full focus:outline-none" placeholder="Password" required />
                            </>
                        )}

                        <p className="text-sm text-tertiary-text text-center cursor-pointer hover:underline" onClick={() => setAuth(!auth)}>
                            {auth ? "Don't have an account?" : "Already have an account?"}
                        </p>

                        <button
                            type="submit"
                            className="bg-main-purple hover:bg-main-purple/90 transition duration-300 text-white py-2 px-8 rounded-full uppercase font-semibold w-full active:scale-95"
                        >
                            {auth ? 'Log In' : 'Sign Up'}
                        </button>
                    </form>
                </div>

                <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-cards-bg p-8 text-center">
                    <p className="text-3xl font-bold text-primary-text">Welcome to NinjaNest!</p>
                    <p className="text-secondary-text text-sm mt-4">Find your perfect student rental home today.</p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;