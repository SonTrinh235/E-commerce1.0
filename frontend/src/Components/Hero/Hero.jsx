import React from "react";
import { useNavigate } from "react-router-dom";

import './Hero.css';

import hand_icon from '../Assets/hand_icon.png';
import arrow_icon from '../Assets/arrow.png';
import hero_image from '../Assets/hero_image.png';

const Hero = () => {
    const navigate = useNavigate();

    const handleDiscoveryClick = () => {
        navigate("/all-products");
    };

    return (
        <div className='hero'>
            <div className="hero-left">
                <div>
                    <div className="hero-hand-icon">
                        <p>Welcome</p>
                        <img src={hand_icon} alt="" />
                    </div>
                    <p>To Our Store</p>
                </div>
                <div className="hero-discovery-btn" onClick={handleDiscoveryClick}>
                    <div>Discovery Now</div>
                    <img src={arrow_icon} alt=""/>
                </div>
            </div>
            <div className="hero-right">
                <img src={hero_image} alt=""/>
            </div>
        </div>
    );
};

export default Hero;
