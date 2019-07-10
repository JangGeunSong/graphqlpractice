const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

// Schema import
const graphQlSchema = require('./DAO/schema/index');
// resolver ==> (same as method) import
const graphQlResolvers = require('./DAO/resolvers/index');
// is-Auth middleware module import
const isAuth = require('./middleware/is-auth');

// express server initialize
const app = express();

// body-parser use
app.use(bodyParser.json());

// middleware that authentication validation detect use
app.use(isAuth);

// graphQL use.
app.use('/graphql', graphqlHttp({
    // define schema
    schema: graphQlSchema,
    // define mutation
    rootValue: graphQlResolvers,
    // graphql development UI setting is true
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@post-rdm59.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() => app.listen(3000))
    .catch((err) => console.log(err))

// If Data base connect successfully then express server run but not connected then catch the what is the error.