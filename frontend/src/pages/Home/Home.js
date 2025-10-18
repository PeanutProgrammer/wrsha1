import React from "react";
import "./Home.css";
import logo from "../../assets/images/dashboard/logo2.png"; // transparent PNG

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-overlay"></div>
      <div className="home-content">
        <h1 className="home-title">الورش الرئيسية للأسلحة رقم (1)</h1>
        <img src={logo} alt="Main Armament Depot Logo" className="home-logo" />
      </div>
    </div>
  );
};

export default Home;
