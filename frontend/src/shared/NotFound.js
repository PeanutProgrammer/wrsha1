import React from "react";
import '../style/NotFound.css';
import { Link } from "react-router-dom";



const NotFound = () => {
    return(
        <div class="page-not-found">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <Link to={"Home"}>Go to Home Page</Link>
      </div>
      
    );
};
export default NotFound;