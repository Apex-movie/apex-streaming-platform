import React from 'react'
import './Footer.css'
import youtube from '../../assets/youtube.png'
import facebook from '../../assets/facebook.png'
import twitter from '../../assets/twitter.png'
import instagram from '../../assets/instagram.png'

const Footer = () => {
  return (
    <div className='footer'>
      <div className='social-icons'>
        <img src={youtube} alt='YouTube' />
        <img src={facebook} alt='Facebook' />
        <img src={twitter} alt='Twitter' />
        <img src={instagram} alt='Instagram' />
      </div>
      <ul className='footer-links'>
        <li>Audio and Subtitles</li>
        <li>Media Center</li>
        <li>Privacy</li>
        <li>Contact Us</li>
        <li>Audio Description</li>  
        </ul>
        <p className='copyright-text'>© 2024 Apex, Inc.</p>
    </div>
  )
}

export default Footer
