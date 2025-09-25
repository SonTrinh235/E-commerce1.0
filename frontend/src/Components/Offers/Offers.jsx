import React from 'react'
import { useNavigate } from "react-router-dom";
import './Offers.css'
import exclusive_image from '../Assets/exclusive_image.png'


const Offers = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate("/all-products");
    };
  return (
    <div className ='offers'>
        <div className="offers-left">
            <h1>Exclusive</h1>
            <h1>Offers For You</h1>
            <p>ONLY ON BEST SELLERS</p>
            <button onClick={handleClick}>Shop Now</button>
        </div>
        <div className="offers-right">
            <img src={exclusive_image} alt="" />
        </div>
    </div>
  )
}

export default Offers