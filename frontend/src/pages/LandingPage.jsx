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
        <div className="relative w-[95vw] md:w-[70vw] lg:w-[60vw] flex flex-col justify-center items-center text-center text-white mx-auto">
          {/* Search Container with Enhanced Glass Morphism */}
          <div className="flex flex-col lg:flex-row items-stretch rounded-2xl bg-gradient-to-br from-gray-500/15 via-gray-400/10 to-gray-600/15 backdrop-blur-xl shadow-2xl p-4 md:p-6 gap-4 mt-8 w-full justify-center border border-gray-500/30 hover:border-[#7c3bf1]/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(124,59,241,0.15)]">

            {/* Location Input with Enhanced Autocomplete */}
            <div className="relative flex-1 lg:flex-[2] group">
              <div className="relative flex items-center gap-3 h-14 px-4 rounded-xl bg-gradient-to-br from-[#1a2332]/80 to-[#222b39]/60 backdrop-blur-sm border border-gray-600/40 hover:border-[#7c3bf1]/60 focus-within:border-[#7c3bf1]/80 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#7c3bf1]/10">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7c3bf1]/20">
                  <img src={locationPin} alt="location" className="w-4 h-4 opacity-80" />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-[11px] text-gray-400 font-medium mb-0.5">Location</label>
                  <input
                    type="text"
                    placeholder="Enter your city or area"
                    className="bg-transparent outline-none w-full text-white placeholder:text-gray-500 text-sm font-medium"
                    value={locationInput}
                    onChange={handleLocationInputChange}
                  />
                </div>
              </div>
              
              {/* Enhanced Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  ref={suggestionRef}
                  className="absolute left-0 right-0 top-full mt-2 bg-gradient-to-br from-[#1a2332]/95 to-[#222b39]/90 backdrop-blur-xl border border-gray-600/50 rounded-xl overflow-hidden z-20 shadow-2xl animate-in slide-in-from-top-2 duration-200"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 text-left text-sm text-gray-300 hover:bg-gradient-to-r hover:from-[#7c3bf1]/20 hover:to-[#2761e9]/20 cursor-pointer transition-all duration-200 border-b border-gray-700/30 last:border-b-0 hover:text-white"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#7c3bf1]/60"></div>
                        {suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Rent Range Slider */}
            <div className="flex-1 lg:flex-[2] group">
              <div className="flex items-center h-14 px-4 rounded-xl bg-gradient-to-br from-[#1a2332]/80 to-[#222b39]/60 backdrop-blur-sm border border-gray-600/40 hover:border-[#7c3bf1]/60 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#7c3bf1]/10">
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7c3bf1]/20">
                        <img src={rupees} alt="rupees" className="w-3.5 h-3.5 opacity-80" />
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">Budget Range</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-gradient-to-r from-[#7c3bf1]/20 to-[#2761e9]/20 rounded-lg px-2.5 py-1 border border-[#7c3bf1]/30">
                        <span className="text-[11px] text-white font-semibold">
                          ₹{rentRange[0].toLocaleString()}
                        </span>
                      </div>
                      <div className="w-3 h-0.5 bg-gradient-to-r from-[#7c3bf1] to-[#2761e9] rounded-full"></div>
                      <div className="flex items-center bg-gradient-to-r from-[#7c3bf1]/20 to-[#2761e9]/20 rounded-lg px-2.5 py-1 border border-[#7c3bf1]/30">
                        <span className="text-[11px] text-white font-semibold">
                          ₹{rentRange[1].toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-1">
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
                        height: "5px",
                        borderRadius: "3px",
                        boxShadow: "0 0 12px rgba(124, 59, 241, 0.3)",
                      }]}
                      handleStyle={[
                        {
                          backgroundColor: "#ffffff",
                          border: "3px solid #7c3bf1",
                          boxShadow: "0 0 15px rgba(124, 59, 241, 0.5), 0 2px 8px rgba(0, 0, 0, 0.2)",
                          height: 18,
                          width: 18,
                          marginTop: -6.5,
                          borderRadius: "50%",
                          cursor: "grab",
                        },
                        {
                          backgroundColor: "#ffffff",
                          border: "3px solid #7c3bf1",
                          boxShadow: "0 0 15px rgba(124, 59, 241, 0.5), 0 2px 8px rgba(0, 0, 0, 0.2)",
                          height: 18,
                          width: 18,
                          marginTop: -6.5,
                          borderRadius: "50%",
                          cursor: "grab",
                        }
                      ]}
                      railStyle={{
                        backgroundColor: "rgba(34, 43, 57, 0.8)",
                        height: "5px",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Search Button */}
            <div className="flex-1 lg:flex-[1] flex items-stretch">
              <button
                className="w-full h-14 px-6 bg-gradient-to-r from-[#7c3bf1] via-[#6c3aed] to-[#2761e9] rounded-xl font-semibold text-sm text-white whitespace-nowrap transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,59,241,0.4)] hover:scale-[1.02] active:scale-[0.98] hover:from-[#8b4bf7] hover:to-[#3468f0] border border-[#7c3bf1]/30 hover:border-[#7c3bf1]/60 relative overflow-hidden group"
                onClick={handleSearch}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <span>Search Properties</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </button>
            </div>

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
