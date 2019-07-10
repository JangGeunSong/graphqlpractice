const jwt = require('jsonwebtoken');

module.exports = (request, response, next) => {
    const authHeader = request.get('Authorization');
    if(!authHeader) {
        request.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]; // Authorization Bearer dfefaf  ==> seems like this
    if(!token || token === '') {
        request.isAuth = false;
        return next();
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'somesupersecretkey');
    } 
    catch (err) {
        request.isAuth = false;
        return next();
    }
    if(!decodedToken) {
        request.isAuth = false;
        return next();
    }
    request.isAuth = true;
    request.userId = decodedToken.userId;
    next();
};