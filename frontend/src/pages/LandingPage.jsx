import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser } from '../features/User/userSlice';
import locationPin from '../assets/location.svg';
import rupees from '../assets/rupee.svg';
import robot from '../assets/LandingRobot.svg';
import shield from '../assets/LandingShield.svg';
import roomate from '../assets/LandingPerson.svg';

import Squares from '../blocks/Backgrounds/Squares/Squares';
useSelector
const LandingPage = () => {
    const features= [
            {
            title: "AI-Powered Recommendation",
            desc: "Smart algorithms that understand your preferences and budget to find the perfect accomodation.",
            icon: robot,
            iconbg: "#33305a"
            },
            {
            title: "Roommate Matcher",
            desc: "Analyzes your preferences and lifestyle to find the most compatible roommates.",
            icon: roomate,
            iconbg: "#23385a"
            },
            {
            title: "Secure Payments",
            desc: "Safe and secure payment processing with instant confirmation.",
            icon: shield,
            iconbg: "#1a4343"
            }
        ]
    let navigate = useNavigate();
    return (
        <>
      
        <div className="relative flex flex-col items-center justify-center py-28  bg-gradient-to-br from-[#1c193d] to-[#141e3b]  text-white min-h-[110vh] ">
            {/* Hero Section 1*/}
          
            <div className=' w-[90vw] md:w-[50vw] flex flex-col justify-center items-center text-center ' >
                <h1 className='my-5 text-5xl font-bold  bg-gradient-to-r from-[#a68cfa] to-[#7c9bf9] bg-clip-text text-transparent'>Find Safe & Affordable Student Rentals</h1>
                {/* <p className='text-lg mt-4'>Discover affordable rental properties near your college, connect with landlords, and manage your payments—all in one place.</p>  */}
                <p className='text-xl font-medium'>Powered by AI</p>
                {/* <div className='flex mt-8 gap-4'>
                    <button className='text-[#fbfbfb] p-2 px-4 bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] rounded-lg font-bold button-click' onClick={() => navigate('/auth')}>Start Searching</button>
                    <button className='text-[#fbfbfb] p-2 px-4 bg-[#18212f] rounded-lg font-bold button-click' onClick={() => navigate('/')}>Learn More</button>
                </div> */}
                <div className='flex flex-col md:flex-row rounded-2xl bg-sub-bg p-6 gap-4 mt-5 w-full md:w-[90%] justify-between'>
                   <div className='pl-2 md:pl-0 flex justify-center items-center rounded-lg bg-cards-bg w-full border-2 border-transparent  focus-within:border-[#7c3bf1]'>
                        <img src={locationPin} className='w-5 h-5'/> 
                        <input type='text' placeholder='Enter location' className='p-2 bg-transparent outline-none  ' />
                    </div>
                    <div className=' pl-2 md:pl-0 flex justify-center items-center rounded-lg bg-cards-bg w-full border-2 border-transparent  focus-within:border-[#7c3bf1]'>
                        <img src={rupees} className='w-4 h-4'/> 
                        <input type='text' placeholder='Rent Range' className='p-2 bg-transparent outline-none'/>
                    </div>
                    <button className='text-[#fbfbfb] p-2 px-6 bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] rounded-lg font-bold button-click  ' onClick={() => navigate('/details')}>Search</button>
                </div>
            </div>
            {/* Hero Section 1 END*/}
        </div>

          {/* Hero Section 2 and 3 Combined */}
          <div className='flex flex-col py-28 items-center bg-gradient-to-b from-[#111827] via-[#111827] via-60% to-[#1e2836]'>

                {/* Hero Section 2 */}
                <div className='flex flex-col items-center justify-center w-[90vw] md:w-[70vw] mb-32 '>
                    <h1 className='text-white text-center text-3xl font-bold my-10'>Smart Features for Smart Living</h1>
                    <div className='flex flex-col md:flex-row justify-between gap-5'>
                        {features.map((feature) => (
                            <FeatureCard title={feature.title} desc={feature.desc} icon={feature.icon} iconbg={feature.iconbg} />
                        ))}
                    </div>
                </div>
                {/* Hero Section 3 */}
                <div className='flex flex-col  items-center justify-center w-[80vw] h-[40vh]'>
                    <h1 className='text-white text-center text-3xl md:text-4xl font-bold my-5'>Ready to Find Your Perfect Student Home?</h1>
                    <p className=' text-secondary-text  text-justify text-base md:text-lg font-medium  '>Join thousands of students who have found their ideal accommodation using NinjaNest.</p>
                    <button className='my-5 text-[#fbfbfb] py-4 px-6 bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] rounded-lg font-bold button-click  ' onClick={() => navigate('/auth')}>Get Started Now</button>
                </div>

            </div>
        </>
    );
};

function FeatureCard(props){
    return (
        <div className='w-full md:w-1/2 bg-sub-bg p-4 rounded-2xl border border-[#222b39] hover:border-[#7c3bf1] hover:bg-[#1c2634] transition-all ease-in-out'>
        <div className={`bg-[${props.iconbg}] p-2 w-10 h-10 rounded-lg flex items-center justify-center my-2`}>
            <img src={props.icon} className='w-6 h-6'/>
        </div>
        <h2 className='text-xl text-white font-bold my-2'>{props.title}</h2>
        <p className=' text-secondary-text font-medium my-2'>{props.desc}</p>
    </div>
    )
}



export default LandingPage;
