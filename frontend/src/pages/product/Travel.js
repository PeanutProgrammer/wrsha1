import React from "react";
import './style/Home.css';
import ProductList from "./ProductList";
import Aside from "../../shared/Aside";
const Travel = () =>{
    return (
        <div className="Home">
            <Aside />
            <ProductList />
        </div>
    );
};
export default Travel;