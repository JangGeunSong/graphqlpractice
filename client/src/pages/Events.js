import React, { Component } from 'react'

import Modal from '../components/Modal/Modal'
import Backdrop from '../components/Backdrop/Backdrop'
import EventList from '../components/Events/EventsList/EventList'
import AuthContext from '../context/auth-context'
import Spinner from '../components/Spinner/Spinner';
import './Events.css'

class EventsPage extends Component {

    state = {
        creating: false,
        events: [],
        isLoading: false,
        selectedEvent: null
    }
    isActive = true;

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
    }

    componentDidMount() {
        this.fetchEvent();
    }
    
    createEventHandler = () => {
        this.setState({ creating: true });
    }

    modalConfirmHandler = () => {
        this.setState({ creating: false });
        const title = this.titleElRef.current.value;
        const price = +this.priceElRef.current.value;
        const date = this.dateElRef.current.value;
        const description = this.descriptionElRef.current.value;
    
        if(
            title.trim().length === 0 || 
            price < 0 || 
            date.trim().length === 0 || 
            description.trim().length === 0
        ) {
            return;
        }

        const event = { title, price, date, description };
        console.log(event);

        const requestBody = {
            query: `
                mutation {
                    createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price}, date: "${date}"}) {
                        _id
                        title
                        description
                        date
                        price
                    }
                }
            `
        };

        const token = this.context.token;

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => {
                if(response.status !== 200 && response.status !== 201) {
                    throw new Error('Failed!');
                }
                return response.json();
            })
            .then(responseData => {
                this.setState(prevState => {
                    const updatedEvents = [...prevState.events];
                    updatedEvents.push({
                        _id: responseData.data.createEvent._id,
                        title: responseData.data.createEvent.title,
                        description: responseData.data.createEvent.description,
                        date: responseData.data.createEvent.date,
                        price: responseData.data.createEvent.price,
                        creator: {
                            _id: this.context.userId
                        }
                    });
                    return {events: updatedEvents};
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    modalCancelHander = () => {
        this.setState({ creating: false, selectedEvent: null });
    }

    fetchEvent = () => {
        this.setState({isLoading: true});
        const requestBody = {
            query: `
                query {
                    events {
                        _id
                        title
                        description
                        date
                        price
                        creator {
                            _id
                            email
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
            }
        })
            .then(response => {
                if(response.status !== 200 && response.status !== 201) {
                    throw new Error('Failed!');
                }
                return response.json();
            })
            .then(responseData => {
                const events = responseData.data.events;
                if(this.isActive) {
                    this.setState({ events: events, isLoading: false });
                }
            })
            .catch(err => {
                console.log(err);
                this.setState({ isLoading: false });
            });
    }

    showDetailHandler = eventId => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === eventId);
            return {selectedEvent: selectedEvent};
        })
    }

    bookEventHandler = () => {
        if(!this.context.token) {
            this.setState({
                selectedEvent: null
            });
            return;
        }
        const requestBody = {
            query: `
                mutation {
                    bookEvent(eventId: "${this.state.selectedEvent._id}") {
                        _id
                        createdAt
                        updatedAt
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
                console.log(responseData);
            })
            .catch(err => {
                console.log(err);
                this.setState({ isLoading: false });
            });
    }

    componentWillUnmount() {
        this.isActive = false;
    }

    render() {
        return (
            <React.Fragment>
                {(this.state.creating || this.state.selectedEvent) && (<Backdrop />)}
                {this.state.creating && (
                    <Modal 
                        title="Add Event" 
                        canCancel 
                        canConfirm 
                        onCancel={this.modalCancelHander} 
                        onConfirm={this.modalConfirmHandler} 
                        confirmText="Confirm"
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title" ref={this.titleElRef}/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="price">Price</label>
                                <input type="number" id="price" ref={this.priceElRef}/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="date">Date</label>
                                <input type="datetime-local" id="date" ref={this.dateElRef}/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="description">Description</label>
                                <textarea id="description" rows="4" ref={this.descriptionElRef}></textarea>
                            </div>
                        </form>
                    </Modal>
                )}
                {this.context.token && (
                    <div className="events-control">
                        <p>Share your own Events!</p>
                        <button className="btn" onClick={this.createEventHandler}>Create Event</button>
                    </div>
                )}
                {this.state.selectedEvent && (
                    <Modal 
                        title={this.state.selectedEvent.title}
                        canCancel 
                        canConfirm 
                        onCancel={this.modalCancelHander} 
                        onConfirm={this.bookEventHandler}
                        confirmText={this.context.token ? "Book" : "Confirm"}
                    >
                        <h2>{this.state.selectedEvent.title}</h2>
                        <h2>${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
                        <p>{this.state.selectedEvent.description}</p>
                    </Modal>
                )}
                {this.state.isLoading ? 
                    (<Spinner />) :
                    (<EventList 
                        events={this.state.events} 
                        authUserId={this.context.userId}
                        onViewDetail={this.showDetailHandler}
                    />) 
                    }
                
            </React.Fragment>
        )
    }
}

export default EventsPage
