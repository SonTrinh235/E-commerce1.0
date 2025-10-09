import React from 'react'
import './Footer.css'
import footer_logo from "../Assets/logo_big.png"
import {FaInstagram, FaWhatsapp, FaPinterest} from 'react-icons/fa'

const Footer = () => {
  return (
    <div className ='footer'>
        <div className='footer-references'>
            <div className="footer-logo">
                <b><span>Good</span>Eats</b>
            </div>

            <ul className ="footer-links">
                <li><b>Company</b></li>
                <li><b>Products</b></li>
                <li><b>Office</b></li>
                <li><b>About</b></li>
                <li><b>Contact</b></li>
            </ul>
            <div className="footer-social-icon">
                <div className="footer-icons-container">
                    <FaInstagram className='footer-icons'></FaInstagram>
                </div>
                <div className="footer-icons-container">
                    <FaWhatsapp className='footer-icons'></FaWhatsapp>
                </div>
                <div className="footer-icons-container">
                    <FaPinterest className='footer-icons'></FaPinterest>
                </div>
            </div>
        </div>
        <div className="footer-copyright">
            <p>Personal project for personal use</p>
            <p>Page is not trademarked by any person any organisation by any means</p>
        </div>
    </div>
  )
}

export default Footer