import React from 'react'
import './NewsLetter.css'

const NewsLetter = () => {
  return (
    <div className = 'newsletter'>
        <h1>Get Exclusive Offers and Updates</h1>
        <p>Subcribe to our newsletter</p>
        <div>
            <input type="text" placeholder='Enter your email' />
            <button>Subscribe</button>
        </div>
    </div>
  )
  
}
export default NewsLetter
