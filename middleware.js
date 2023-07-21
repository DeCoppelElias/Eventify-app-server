const admin = require('./config/firebase');

class Middleware{
    async decodeToken(req, res, next) {
        if (req.headers.authorization === undefined){
            res.status(401).send('Unauthorized request');
            return res;
        }
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).send('Unauthorized request');
        }
    
        try {
            const decodedValue = await admin.auth().verifyIdToken(token);
            if(decodedValue){
                return next();
            }
            res.status(400).send('Invalid token');
        }
        catch (ex) {
            res.status(400).send('Invalid token');
        }
    }
}

module.exports = new Middleware();