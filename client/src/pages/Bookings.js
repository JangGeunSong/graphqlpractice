import React, { Component } from 'react'

import AuthContext from '../context/auth-context';
import Spinner from '../components/Spinner/Spinner';

class BookingsPage extends Component {
    state = {
        isLoading: null,
        bookings: []
    }

    static contextType = AuthContext;

    componentDidMount() {
        this.fetchBookings();
    }
    
    fetchBookings = () => {
        this.setState({isLoading: true});
        const requestBody = {
            query: `
                query {
                    bookings {
                        _id
                        createdAt
                        event {
                            _id
                            title
                            date
                        }
                    }
                }
            `
        };

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.context.token
            }
        })
            .then(response => {
                if(response.status !== 200 && response.status !== 201) {
                    throw new Error('Failed!');
                }
                return response.json();
            })
            .then(responseData => {
                const bookings = responseData.data.bookings;
                this.setState({ bookings: bookings, isLoading: false });
            })
            .catch(err => {
                console.log(err);
                this.setState({ isLoading: false });
            });
    }

    render() {
        return (
            <React.Fragment>
                {this.state.isLoading ? 
                    (<Spinner />) :
                    (<ul>
                        {this.state.bookings.map(booking => (
                            <li key={booking._id}>
                                {booking.event.title} - {new Date(booking.createdAt).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>)
                }
            </React.Fragment>
        )
    }
}

export default BookingsPage
