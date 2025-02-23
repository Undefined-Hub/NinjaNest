import React, { useState } from 'react'
import pfp from '../assets/pfp.png'
import house1 from '../assets/house1.jpg'
import pay from '../assets/pay.svg'
import calendar from '../assets/calendar.svg'
import people from '../assets/people.svg'
const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('Overview') // State to hold the active tab
    return (
        <>
            <div className='flex justify-center items-center bg-main-bg'> {/* Main container for profile page */}
                <div className='w-full mx-44 my-16 flex'> {/* Inner container which will be divided into 2 sub sections */}
                    <div className='flex w-1/4 bg-sub-bg rounded-2xl mr-4 p-8'> {/* Left section where profile name & tabs will be shown*/}
                        <div className='flex flex-col w-full'>
                            {/* Section to hold profile image, name & username */}
                            <div className='flex justify-start items-center space-x-5'> {/* Profile image and details */}
                                <div>
                                    <img src={pfp} alt='profile' className='h-20 w-20 rounded-full object-cover' />
                                </div>
                                <div className='flex flex-col justify-evenly items-start h-full'> {/* Profile name & username */}
                                    <p className='text-white text-2xl font-bold hover:cursor-pointer'>Pawan Malgavi</p> {/* Profile name */}
                                    <p className='text-secondary-text text-lg font-semibold hover:cursor-pointer'>@pawann</p> {/* Profile username */}
                                </div>
                            </div>

                            {/* Section to hold multiple tabs */}
                            <div className='flex flex-col w-full h-full mt-8 space-y-5'> {/* Tabs section */}
                                <div
                                    className={`flex flex-col hover:cursor-pointer active:scale-95 transition-all ease-in-out duration-300 p-4 rounded-2xl ${activeTab === 'Overview' ? 'bg-violet-900 text-tertiary-text' : 'bg-transparent text-secondary-text'
                                        }`}
                                    onClick={() => setActiveTab('Overview')}
                                >
                                    <p className='text-xl font-semibold'>Overview</p>
                                </div>
                                <div
                                    className={`flex flex-col hover:cursor-pointer active:scale-95 transition-all ease-in-out duration-300 p-4 rounded-2xl ${activeTab === 'Properties' ? 'bg-violet-900 text-tertiary-text' : 'bg-transparent text-secondary-text'
                                        }`}
                                    onClick={() => setActiveTab('Properties')}
                                >
                                    <p className='text-xl font-semibold'>My Properties</p>
                                </div>
                                <div className='flex flex-col hover:cursor-pointer active:scale-95 transition-all ease-in-out space-y-4 p-4 rounded-2xl'>
                                    <p className='text-secondary-text text-xl font-semibold'>Roommates</p>
                                </div>
                                <div className='flex flex-col hover:cursor-pointer active:scale-95 transition-all ease-in-out space-y-4 p-4 rounded-2xl'>
                                    <p className='text-secondary-text text-xl font-semibold'>Payment</p>
                                </div>
                                <div className='flex flex-col hover:cursor-pointer active:scale-95 transition-all ease-in-out space-y-4 p-4 rounded-2xl'>
                                    <p className='text-secondary-text text-xl font-semibold'>Settings</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex w-3/4 ml-4'> {/* Right section where profile details will be shown as per the selected tab*/}
                        {activeTab === 'Overview' &&
                            <div className='flex flex-col h-full w-full space-y-8'> {/* Profile details will be shown here.. "PROFILE'S TAB" */}
                                <div className='flex w-full h-auto justify-between space-x-8'> {/* Section 1 : Next Payment, Lease Ends, Roommates */}
                                    <div className='flex flex-col justify-center space-y-5 items-center w-full h-full text-white bg-sub-bg rounded-2xl p-8'> {/* Next Payment */}
                                        <div className='w-full flex justify-between'> {/* Contain the logo and the title text */}
                                            <div className='flex justify-center items-center h-16 w-16 bg-green-900 rounded-2xl'>
                                                <img src={pay} alt='next-payment' className='h-8 w-8 rounded-2xl' />
                                            </div>
                                            <div className='flex flex-col justify-center items-center text-secondary-text font-semibold text-lg'>
                                                <p>Next Payment</p>
                                            </div>
                                        </div>
                                        <div className='h-full w-full flex flex-col space-y-3 justify-between'> {/* Contain the amount and the due date */}
                                            <div className='flex  text-white font-semibold text-2xl'>
                                                &#8377; 1,800
                                            </div>
                                            <p className='text-secondary-text font-semibold text-lg'>Due March 1, 2025</p>
                                        </div>
                                    </div>

                                    <div className='flex flex-col justify-center space-y-5 items-center w-full h-full text-white bg-sub-bg rounded-2xl p-8'> {/* Lease Ends */}
                                        <div className='w-full flex justify-between'> {/* Contain the logo and the title text */}
                                            <div className='flex justify-center items-center h-16 w-16 bg-violet-900 rounded-2xl'>
                                                <img src={calendar} alt='next-payment' className='h-8 w-8 rounded-2xl' />
                                            </div>
                                            <div className='flex flex-col justify-center items-center text-secondary-text font-semibold text-lg'>
                                                <p>Lease Ends</p>
                                            </div>
                                        </div>
                                        <div className='h-full w-full flex flex-col space-y-3 justify-between'> {/* Contain the amount and the due date */}
                                            <div className='flex  text-white font-semibold text-2xl'>
                                                250 Days
                                            </div>
                                            <p className='text-secondary-text font-semibold text-lg'>December 31, 2025</p>
                                        </div>
                                    </div>

                                    <div className='flex flex-col justify-center space-y-5 items-center w-full h-full text-white bg-sub-bg rounded-2xl p-8'> {/* Roommates */}
                                        <div className='w-full flex justify-between'> {/* Contain the logo and the title text */}
                                            <div className='flex justify-center items-center h-16 w-16 bg-blue-900 rounded-2xl'>
                                                <img src={people} alt='next-payment' className='h-8 w-8' />
                                            </div>
                                            <div className='flex flex-col justify-center items-center text-secondary-text font-semibold text-lg'>
                                                <p>Roommates</p>
                                            </div>
                                        </div>
                                        <div className='h-full w-full flex flex-col space-y-3 justify-between'> {/* Contain the amount and the due date */}
                                            <div className='flex  text-white font-semibold text-2xl'>
                                                3 Active
                                            </div>
                                            <p className='text-secondary-text font-semibold text-lg'>All verified</p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col w-full bg-sub-bg rounded-2xl p-8 space-y-6'> {/* Section 2 : Current property card */}
                                    <div className='flex justify-between'> {/* Title of the section */}
                                        <p className='text-white text-2xl font-bold'>Current Property</p>
                                        <p className='text-tertiary-text text-base font-semibold self-center hover:cursor-pointer hover:underline hover:decoration-2 hover:underline-offset-2'>View Details</p>
                                    </div>
                                    <div className='w-full'> {/* Card containing the property details */}
                                        <div className='flex space-x-6 h-full justify-between rounded-2xl'> {/* Property image container */}
                                            <div className='w-1/2 h-[250px] overflow-hidden rounded-2xl'> {/* Fixed size container */}
                                                <img src={house1} alt='property' className='h-full w-full object-cover' />
                                            </div>
                                            <div className='flex flex-col w-1/2 h-full space-y-5'> {/* Property details container */}
                                                <p className='text-white text-2xl font-semibold'>Bhoot Bangla</p>
                                                <p className='text-secondary-text font-semibold text-lg'>1.2 Kilometers away from D. Y. Patil College of Engineering and Technology</p>
                                                <div className='flex justify-between w-full space-x-5'> {/* Property features */}
                                                    <div className='flex flex-col h-full w-1/2 bg-cards-bg rounded-2xl p-4'>
                                                        <p className='text-lg text-secondary-text font-semibold'>Room Type</p>
                                                        <p className='text-xl text-white font-semibold'> 3 BHK</p>
                                                    </div>
                                                    <div className='flex flex-col h-full w-1/2 bg-cards-bg rounded-2xl p-4'>
                                                        <p className='text-lg text-secondary-text font-semibold'>Floor</p>
                                                        <p className='text-xl text-white font-semibold'>5th Floor</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col w-full bg-sub-bg rounded-2xl p-8'> {/* Section 3 : Roommates */}
                                    <div className='flex flex-col justify-between space-y-6'>
                                        <p className='text-white text-2xl font-bold'>Roommates</p>
                                        <div className='flex justify-between w-full space-x-5'> {/* Roommates details */}
                                            <div className='flex w-1/2 bg-cards-bg rounded-2xl p-4 space-x-5'>
                                                <div className='flex h-full justify-center items-center'> {/* Roommate image */}
                                                    <img src='https://placehold.co/100' alt='roommate' className='h-16 w-16 rounded-full' />
                                                </div>
                                                <div className='flex flex-col justify-evenly items-start h-full p-2'> {/* Roommate details */}
                                                    <p className='text-lg text-white font-semibold'>Aryan Patil</p>
                                                    <p className='text-secondary-text font-semibold text-lg'>Computer Science & Engg.</p>
                                                </div>
                                            </div>
                                            <div className='flex w-1/2 bg-cards-bg rounded-2xl p-4 space-x-5'>
                                                <div className='flex h-full justify-center items-center'> {/* Roommate image */}
                                                    <img src='https://placehold.co/100' alt='roommate' className='h-16 w-16 rounded-full' />
                                                </div>
                                                <div className='flex flex-col justify-evenly items-start h-full p-2'> {/* Roommate details */}
                                                    <p className='text-lg text-white font-semibold'>Harshwardhan Patil</p>
                                                    <p className='text-secondary-text font-semibold text-lg'>Computer Science & Engg.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        {activeTab === 'Properties' &&
                            <div className='w-full h-full flex flex-col space-y-8'> {/* Section to show the properties */}
                                {/* First Property card */}
                                <div className='flex flex-col w-full bg-sub-bg rounded-2xl p-8 space-y-6'> {/* Property cards */}
                                    <div className='flex justify-between'> {/* Title of the section */}
                                        <p className='text-white text-2xl font-bold'>Nagala Park Property, Kolhapur</p>
                                        <p className='text-tertiary-text text-base font-semibold self-center hover:cursor-pointer hover:underline hover:decoration-2 hover:underline-offset-2'>View Details</p>
                                    </div>
                                    <div className='w-full'> {/* Card containing the property details */}
                                        <div className='flex space-x-6 h-full justify-between rounded-2xl'> {/* Property image container */}
                                            <div className='w-1/2 h-[250px] overflow-hidden rounded-2xl'> {/* Fixed size container */}
                                                <img src={house1} alt='property' className='h-full w-full object-cover' />
                                            </div>
                                            <div className='flex flex-col w-1/2 h-full space-y-5'> {/* Property details container */}
                                                <p className='text-white text-2xl font-semibold'>Bhoot Bangla</p>
                                                <p className='text-secondary-text font-semibold text-lg'>1.2 Kilometers away from D. Y. Patil College of Engineering and Technology</p>
                                                <div className='flex justify-between w-full space-x-5'> {/* Property features */}
                                                    <div className='flex flex-col h-full w-1/2 bg-cards-bg rounded-2xl p-4'>
                                                        <p className='text-lg text-secondary-text font-semibold'>Room Type</p>
                                                        <p className='text-xl text-white font-semibold'> 3 BHK</p>
                                                    </div>
                                                    <div className='flex flex-col h-full w-1/2 bg-cards-bg rounded-2xl p-4'>
                                                        <p className='text-lg text-secondary-text font-semibold'>Floor</p>
                                                        <p className='text-xl text-white font-semibold'>5th Floor</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Second Property Card */}
                                <div className='flex flex-col w-full bg-sub-bg rounded-2xl p-8 space-y-6'> {/* Property cards */}
                                    <div className='flex justify-between'> {/* Title of the section */}
                                        <p className='text-white text-2xl font-bold'>Kasaba Bawada Property, Kolhapur</p>
                                        <p className='text-tertiary-text text-base font-semibold self-center hover:cursor-pointer hover:underline hover:decoration-2 hover:underline-offset-2'>View Details</p>
                                    </div>
                                    <div className='w-full'> {/* Card containing the property details */}
                                        <div className='flex space-x-6 h-full justify-between rounded-2xl'> {/* Property image container */}
                                            <div className='w-1/2 h-[250px] overflow-hidden rounded-2xl'> {/* Fixed size container */}
                                                <img src={house1} alt='property' className='h-full w-full object-cover' />
                                            </div>
                                            <div className='flex flex-col w-1/2 h-full space-y-5'> {/* Property details container */}
                                                <p className='text-white text-2xl font-semibold'>Hogwarts Castle</p>
                                                <p className='text-secondary-text font-semibold text-lg'>1.2 Kilometers away from D. Y. Patil College of Engineering and Technology</p>
                                                <div className='flex justify-between w-full space-x-5'> {/* Property features */}
                                                    <div className='flex flex-col h-full w-1/2 bg-cards-bg rounded-2xl p-4'>
                                                        <p className='text-lg text-secondary-text font-semibold'>Room Type</p>
                                                        <p className='text-xl text-white font-semibold'>13 BHK</p>
                                                    </div>
                                                    <div className='flex flex-col h-full w-1/2 bg-cards-bg rounded-2xl p-4'>
                                                        <p className='text-lg text-secondary-text font-semibold'>Floor</p>
                                                        <p className='text-xl text-white font-semibold'>5th Floor</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProfilePage
