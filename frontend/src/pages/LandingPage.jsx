import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../features/User/userSlice";
import locationPin from "../assets/location.svg";
import rupees from "../assets/rupee.svg";
import robot from "../assets/LandingRobot.svg";
import shield from "../assets/LandingShield.svg";
import roomate from "../assets/LandingPerson.svg";
import blob from "../assets/blob.svg";
import blob2 from "../assets/blob2.svg";
import Squares from "../blocks/Backgrounds/Squares/Squares";
useSelector;
import { useAuth } from "../CustomHook/useAuth";
const LandingPage = () => {
  const { isLoggedIn, user } = useAuth();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // const user = useSelector((state) => state.user.user);
  const features = [
    {
      title: "AI-Powered Recommendation",
      desc: "Smart algorithms that understand your preferences and budget to find the perfect accomodation.",
      icon: robot,
      iconbg: "#33305a",
    },
    {
      title: "Roommate Matcher",
      desc: "Analyzes your preferences and lifestyle to find the most compatible roommates.",
      icon: roomate,
      iconbg: "#23385a",
    },
    {
      title: "Secure Payments",
      desc: "Safe and secure payment processing with instant confirmation.",
      icon: shield,
      iconbg: "#1a4343",
    },
  ];
  let navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col justify-center items-center bg-main-bg relative min-h-[100vh] py-28">
        <div className="absolute top-0 left-0 w-full h-full ">
          <Squares
            speed={0.5}
            squareSize={80}
            direction="up" // up, down, left, right, diagonal
            borderColor="#222b39"
            hoverFillColor="#a68cfa"
          />
        </div>
        <span className="relative mx-5 md:mx-0">
          <h1 className="my-5 text-5xl font-bold text-center bg-gradient-to-r from-[#a68cfa] to-[#7c9bf9] bg-clip-text text-transparent">
            Find Safe & Affordable Student Rentals
          </h1>
        </span>
        <p className="relative text-xl font-medium text-white">Powered by AI</p>

        {/* Hero Section 1*/}
        <div className=" relative w-[90vw] md:w-[50vw] flex flex-col justify-center items-center text-center text-white ">
          <div
            className="flex flex-col md:flex-row rounded-2xl bg-gray-500 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100 p-6 gap-4 mt-5 w-full md:w-[90%] justify-between"
          >
            <div className="pl-2 md:pl-0 flex justify-center items-center rounded-lg bg-cards-bg w-full border-2 border-transparent  focus-within:border-[#7c3bf1]">
              <img src={locationPin} className="w-5 h-5" />
              <input
                type="text"
                placeholder="Enter location"
                className="p-2 bg-transparent outline-none  "
              />
            </div>
            <div className=" pl-2 md:pl-0 flex justify-center items-center rounded-lg bg-cards-bg w-full border-2 border-transparent  focus-within:border-[#7c3bf1]">
              <img src={rupees} className="w-4 h-4" />
              <input
                type="text"
                placeholder="Rent Range"
                className="p-2 bg-transparent outline-none"
              />
            </div>
            <button
              className="text-[#fbfbfb] p-2 px-6 bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] rounded-lg font-bold button-click  "
              onClick={() => navigate("/explore")}
            >
              Search
            </button>
          </div>
        </div>
        {/* Hero Section 1 END*/}
      </div>

      {/* Hero Section 2 and 3 Combined */}
      <div className=" relative bg-gradient-to-b from-[#0a1a2b] via-[#0a1a2b] via-60% to-[#162a3b] backdrop-blur-3xl overflow-hidden ">
        <img src={blob} alt="" className="absolute top-[-200px] right-[-100px] md:top-[-300px]  md:right-[-300px] md:w-[50%] z-[-1] blur-2xl" />
        <img src={blob2} alt="" className="absolute bottom-[-200px] left-[-200px] md:bottom-[-300px] md:left-[-300px] md:w-[50%] z-[-1] blur-2xl" />
        <div className=" flex flex-col py-28 items-center ">
          {/* Hero Section 2 */}
          <div className="flex flex-col items-center justify-center w-[90vw] md:w-[70vw] mb-32 ">
            <h1 className="text-white text-center text-3xl font-bold my-10">
              Smart Features for Smart Living
            </h1>
            <div className="flex flex-col md:flex-row justify-between gap-5">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  desc={feature.desc}
                  icon={feature.icon}
                  iconbg={feature.iconbg}
                />
              ))}
            </div>
          </div>
          {/* Hero Section 3 */}
          <div className="flex flex-col  items-center justify-center w-[80vw] h-[40vh]">
            <h1 className="text-white text-center text-3xl md:text-4xl font-bold my-5">
              Ready to Find Your Perfect Student Home?
            </h1>
            <p className=" text-secondary-text  text-justify text-base md:text-lg font-medium  ">
              Join thousands of students who have found their ideal accommodation
              using NinjaNest.
            </p>
            <button
              className="my-5 text-[#fbfbfb] py-4 px-6 bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] rounded-lg font-bold button-click  "
              onClick={() => {
                if (isLoggedIn) {
                  navigate("/explore");
                } else {
                  navigate("/auth");
                }
              }}
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

function FeatureCard(props) {
  return (
    <div className="w-full md:w-1/2 bg-sub-bg p-4 rounded-2xl border border-[#222b39] hover:border-[#7c3bf1] hover:bg-[#1c2634] backdrop-filter backdrop-blur bg-opacity-50 hover:bg-opacity-70  transition-all ease-in-out">
      <div
        className={`bg-[${props.iconbg}] p-2 w-10 h-10 rounded-lg flex items-center justify-center my-2`}
      >
        <img src={props.icon} className="w-6 h-6" />
      </div>
      <h2 className="text-xl text-white font-bold my-2">{props.title}</h2>
      <p className=" text-secondary-text font-medium my-2">{props.desc}</p>
    </div>
  );
}

export default LandingPage;
