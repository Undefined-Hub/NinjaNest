import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "../CustomHook/useAuth";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import '../styles/index.css';
import cities from "../services/cities.json";

const LandingPage = () => {
  const { isLoggedIn, user } = useAuth();
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  const [rentRange, setRentRange] = useState([1000, 20000]); // default min/max

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const handleSearch = () => {
    // Pass location and rent range as query params
    navigate(
      `/explore?location=${encodeURIComponent(locationInput)}&minRent=${rentRange[0]}&maxRent=${rentRange[1]}`
    );
  };

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter cities based on input
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);

    if (value.trim()) {
      const filteredCities = cities
        .filter(city => 
          city.District.toLowerCase().includes(value.toLowerCase())
        )
        .map(city => city.District)
        // Remove duplicates
        .filter((city, index, self) => self.indexOf(city) === index)
        .slice(0, 5); // Limit to 5 suggestions
      
      setSuggestions(filteredCities);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setLocationInput(suggestion);
    setShowSuggestions(false);
  };

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
        {/* Hero Section */}
        {/* Hero Section */}
        <div className="relative w-[90vw] md:w-[60vw] flex flex-col justify-center items-center text-center text-white mx-auto">
          <div className="flex flex-col md:flex-row items-center rounded-xl bg-gray-500/10 backdrop-blur-sm p-3 gap-3 mt-6 w-full md:w-[85%] justify-center border border-gray-700/30 hover:border-[#7c3bf1]/30 transition-all duration-300">

            {/* Location Input with Autocomplete */}
            <div className="relative flex items-center gap-2 h-11 px-3 rounded-lg bg-cards-bg w-full md:w-[35%] border border-gray-700/30 hover:border-[#7c3bf1]/30 transition-all duration-300">
              <img src={locationPin} alt="location" className="w-4 h-4 opacity-70" />
              <input
                type="text"
                placeholder="Enter location"
                className="bg-transparent outline-none w-full text-white placeholder:text-gray-400 text-sm"
                value={locationInput}
                onChange={handleLocationInputChange}
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  ref={suggestionRef}
                  className="absolute left-0 right-0 top-full mt-1 bg-cards-bg border border-gray-700/30 rounded-lg overflow-hidden z-10"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#222b39] cursor-pointer transition-colors duration-200"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rent Range Slider */}
            <div className="flex items-center h-11 px-3 rounded-lg bg-cards-bg w-full md:w-[35%] border border-gray-700/30 hover:border-[#7c3bf1]/30 transition-all duration-300">
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <img src={rupees} alt="rupees" className="w-3.5 h-3.5 opacity-70" />
                    <span className="text-[10px] text-gray-400 ml-1">Range</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#222b39]/50 rounded px-2 py-0.5">
                      <span className="text-[10px] text-gray-400">
                        {rentRange[0].toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">-</span>
                    <div className="flex items-center bg-[#222b39]/50 rounded px-2 py-0.5">
                      <span className="text-[10px] text-gray-400">
                        {rentRange[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Slider
                  range
                  min={500}
                  max={100000}
                  step={500}
                  value={rentRange}
                  onChange={setRentRange}
                  className="my-1"
                  trackStyle={[{
                    backgroundColor: "#7c3bf1",
                    height: "4px",
                    boxShadow: "0 0 8px rgba(124, 59, 241, 0.2)",
                  }]}
                  handleStyle={[
                    {
                      backgroundColor: "#ffffff",
                      border: "2px solid #7c3bf1",
                      boxShadow: "0 0 10px rgba(124, 59, 241, 0.4)",
                      height: 14,
                      width: 14,
                      marginTop: -5,
                      borderRadius: "50%",
                    },
                    {
                      backgroundColor: "#ffffff",
                      border: "2px solid #7c3bf1",
                      boxShadow: "0 0 10px rgba(124, 59, 241, 0.4)",
                      height: 14,
                      width: 14,
                      marginTop: -5,
                      borderRadius: "50%",
                    }
                  ]}
                  railStyle={{
                    backgroundColor: "#222b39",
                    height: "4px",
                  }}
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              className="h-11 px-6 bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,59,241,0.3)] hover:scale-[1.02] active:scale-[0.98] w-full md:w-[20%]"
              onClick={handleSearch}
            >
              Search
            </button>

          </div>
        </div>
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
