"use client";
import Head from 'next/head';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Head>
        <title>APIGen</title>
        <meta name="description" content="API Generator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className={`navbar ${isOpen ? 'active' : ''}`}>
        <div className="navbarContainer">
          <div className="navbarLogo">
            <span>APIGen</span>
          </div>
          <div className="menuIcon" onClick={toggleMenu}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <div className="navbarLinks">
            <a href="https://www.linkedin.com/company/omtun/" className="getStarted">Contact</a>
          </div>
        </div>
      </nav>
    </div>
  );
}
