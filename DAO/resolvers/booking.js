const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformEvent, transformBooking } = require('./merge');

module.exports = {
    // look the all reservations
    bookings: async (args, request) => {
        if(!request.isAuth) {
            throw new Error('Unauthenticated!');
        }
        try {
            const bookings = await Booking.find({user: request.userId});
            return bookings.map(booking => {
                return transformBooking(booking);
            })                
        } 
        catch (err) {
            throw err;
        }
    },
    // book Event method
    bookEvent: async (args, request) => {
        if(!request.isAuth) {
            throw new Error('Unauthenticated!');
        }
        const fetchedEvent = await Event.findOne({ _id: args.eventId })
        const booking = new Booking({
            user: request.userId,
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result);
    },
    // cancel booking
    cancelBooking: async (args, request) => {
        if(!request.isAuth) {
            throw new Error('Unauthenticated!');
        }
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({ _id: args.bookingId });
            return event;    
        } 
        catch (err) {
            throw err;
        }
    } 
}