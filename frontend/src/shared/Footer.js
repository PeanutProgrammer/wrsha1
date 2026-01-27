import React from "react";
import "../style/Footer.css";

const Footer = ({ collapsed }) => {
  return (
    <footer className={`app-footer ${collapsed ? "collapsed" : ""}`}>
      <div className="container">
        <p>
          جميع الحقوق &copy; محفوظة لفريق عمل نظم المعلومات بالورش الرئيسية
          للأسلحة رقم (1) .
        </p>
      </div>
    </footer>
  );
};

export default Footer;
