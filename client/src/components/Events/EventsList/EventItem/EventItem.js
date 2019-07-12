import React from 'react';

import './EventItem.css';

const eventItem = props => (
    <li key={props.eventId} className="event__list-item">
        <div>
            <h1>{props.title}</h1>
            <h2>$199.99</h2>
        </div>
        <div>
            <button>View details</button>
            <p>Your the owner this events</p>
        </div>
    </li>
); 

export default eventItem;