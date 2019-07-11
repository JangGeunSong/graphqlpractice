import React from "react";
import { NavLink } from "react-router-dom";

import './MainNavigation.css'

// NavLink is very nice to move to page without no reload pages
const mainNavigation = props => (
  <header className="main-Navigation">
    <div className="main-Navigation__logo">
      <h1>EasyEvent</h1>
    </div>
    <div className="main-Navigation__items">
      <ul>
        <li>
          <NavLink to="/auth">Authenticate</NavLink>
        </li>
        <li>
          <NavLink to="/events">Events</NavLink>
        </li>
        <li>
          <NavLink to="/bookings">Bookings</NavLink>
        </li>
      </ul>
    </div>
  </header>
);

export default mainNavigation;
