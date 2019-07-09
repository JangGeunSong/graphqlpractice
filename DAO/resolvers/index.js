const bcrypt = require('bcryptjs');

// import every parts of the CRUD elements that link between app to database
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

// resolver return value has two options 1. promise catch approach 2. async await approach  ==> Asynchronous function approach
const events = async (eventIds) => {
    try {
        const events = await Event.find({ _id: {$in: eventIds} })
        return events.map(event => {
            return { 
                ...event._doc, 
                _id: event.id, 
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator) 
            };
        });
    }
    catch(err) {
        throw err;
    }
}

// const user = (userId) => {
//     return User.findById(userId)
//         .then(user => {
//             return { 
//                 ...user._doc, 
//                 _id: user.id, 
//                 createdEvents: events.bind(this, user._doc.createdEvents) 
//             };
//         })
//         .catch(err => {
//             throw err
//         })
// }

const user = async userId => {
    try {
        const user = await User.findById(userId)
        return { 
            ...user._doc, 
            _id: user.id, 
            createdEvents: events.bind(this, user._doc.createdEvents) 
        };
    }
    catch (err) {
        throw err;
    }
}

module.exports = {
    // look the all events
    events: async () => {
        try {
            const events = await Event.find()
            return events.map(event => {
                return { 
                    ...event._doc, 
                    _id: event._doc._id.toString(), 
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator) 
                };
            });
            // If _id is not printed then use that _id part (In my case don't use that syntax run very well but write the code.)
        } 
        catch (err) {
            throw err;
        }
    },
    // look the all reservations
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return { 
                    ...booking._doc, 
                    _id: booking.id, 
                    createdAt: new Date(booking._doc.createdAt).toISOString(), 
                    updatedAt: new Date(booking._doc.updatedAt).toISOString() 
                }
            })                
        } 
        catch (err) {
            throw err;
        }
    },
    // create event method
    createEvent: async args => {
        // const event = {
        //     _id: Math.random().toString(),
        //     title: args.eventInput.title,
        //     description: args.eventInput.description,
        //     price: args.eventInput.price,
        //     date: new Date().toISOString()
        //     // Date field is automatically generate by push the create event mutation(that means POST request sended)
        // };
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: new Date().toISOString(),
            creator: '5d235acfa3686e3f0892ba42'
        });
        // Don't need the _id field because it will create automatically by mongodb
        let createdEvent;
        try {
            const result = await event.save();
            createdEvent = { 
                ...result._doc,
                date: new Date(event._doc.date).toISOString(), 
                creator: user.bind(this, result._doc.creator)
            }
            const creator = await User.findById('5d235acfa3686e3f0892ba42');
            if(!creator) {
                throw new Error('User not found!')
            }
            creator.createdEvents.push(event);
            await creator.save();
            return createdEvent;
        } 
        catch (err) {
            throw err;
        }
        // save mongodb and check the result the save infomation.
    },
    // create user method
    createUser: async args => {
        try {
            const existingUser = await User.findOne({email: args.userInput.email});
            if(existingUser) {
                throw new Error('User exist already!')
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
                // To avoid password send to plain text must create hash value 
            })
            const result = await user.save();
            return { ...result._doc, password: null, _id: result.id }
        }
        catch (err) {
            throw err;
        }
    },
    // book Event method
    bookEvent: async args => {
        const fetchedEvent = await Event.findOne({ _id: args.eventId })
        const booking = new Booking({
            user: '5d235acfa3686e3f0892ba42',
            event: fetchedEvent
        });
        const result = await booking.save();
        return { 
            ...result._doc, 
            _id: result.id, 
            createdAt: new Date(booking._doc.createdAt).toISOString(), 
            updatedAt: new Date(booking._doc.updatedAt).toISOString() 
        };
    } 
}