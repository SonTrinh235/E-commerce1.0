import { useNavigate } from "react-router-dom";

import './Hero.css';

import hero_image from '../../assets/hero_image.png';

import { FiArrowRight } from "react-icons/fi";


const Hero = () => {
    const navigate = useNavigate();

    const handleDiscoveryClick = () => {
        navigate("/all-products");
    };

    return (
        <div className='hero'>
            <div className="hero-left">
                <div>
                    <h1>GoodEats</h1>
                    <h1>Eat Clean Today</h1>
                    <p>The greenest and freshest of produce, only at GoodEats</p>
                </div>
                <div className="hero-discovery-btn" onClick={handleDiscoveryClick}>
                    <h2>Shop Now</h2>
                    <FiArrowRight className="hero-icons"></FiArrowRight>
                </div>
            </div>
            <div className="hero-right">
                <img src={hero_image} alt=""/>
            </div>
        </div>
    );
};

export default Hero;
