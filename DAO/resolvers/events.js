const Event = require('../../models/event');
const User = require('../../models/user');

const { transformEvent } = require('./merge');

module.exports = {
    // look the all events
    events: async () => {
        try {
            const events = await Event.find()
            return events.map(event => {
                return transformEvent(event);
            });
            // If _id is not printed then use that _id part (In my case don't use that syntax run very well but write the code.)
        } 
        catch (err) {
            throw err;
        }
    },
    // create event method
    createEvent: async (args, request) => {
        // const event = {
        //     _id: Math.random().toString(),
        //     title: args.eventInput.title,
        //     description: args.eventInput.description,
        //     price: args.eventInput.price,
        //     date: new Date().toISOString()
        //     // Date field is automatically generate by push the create event mutation(that means POST request sended)
        // };
        if(!request.isAuth) {
            throw new Error('Unauthenticated!');
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: new Date().toISOString(),
            creator: request.userId
        });
        // Don't need the _id field because it will create automatically by mongodb
        let createdEvent;
        try {
            const result = await event.save();
            createdEvent = transformEvent(result);
            const creator = await User.findById(request.userId);
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
}