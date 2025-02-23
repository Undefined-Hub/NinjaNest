import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector ,useDispatch} from 'react-redux';
import { fetchUser } from '../features/User/userSlice';
useSelector
const LandingPage = () => {
    
    return (
        <div>
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center py-28">
                <div className="flex flex-col items-center justify-center w-2/3">
                    <section className="text-gray-600 body-font">
                        <div className="container mx-auto flex px-5 md:flex-row flex-col items-center">
                            <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
                                <h1 className="font-extrabold">
                                    <span className="title-font sm:text-5xl text-2xl mb-4 text-gray-900">Find Your Perfect Student Home Near Campus!    </span>
                                </h1>
                                <p className="mb-8 leading-relaxed my-4">
                                    <span className="font-medium">
                                        Discover affordable rental properties near your college, connect with landlords, and manage your payments—all in one place.
                                    </span>
                                </p>
                                <div className="flex justify-center place-content-evenly">
                                    {/* TODO: 'Start searching' button should be replaced with a search field */}
                                    <button className="inline-flex text-white bg-blue-500 border-0 py-2 px-4 focus:outline-none hover:bg-blue-600 rounded text-lg transition duration-300" onClick={() => navigate('/auth')}>
                                        Start Searching
                                        <div className='flex flex-col items-center justify-center h-full'>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7"></path>
                                            </svg>
                                        </div>
                                    </button>
                                    <button className="ml-4 inline-flex text-gray-500 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 font-normal rounded text-lg" onClick={() => navigate('/')}>Learn More</button>
                                </div>
                            </div>
                            <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
                                <img className="object-cover object-center rounded" alt="hero" src="https://dummyimage.com/720x600" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
           
    );
};

export default LandingPage;
