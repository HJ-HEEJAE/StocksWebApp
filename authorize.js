const jwt = require('jsonwebtoken');
// custom middleware for authorization
const authorize = (req, res, next) => {
    const authorization = req.headers.authorization;
    let token = null;
    // Retrieve token
    if (authorization && authorization.split(" ").length == 2){
      token = authorization.split(" ")[1];
      console.log("Token: ", token);
    }else{
      console.log("Unauthorized user");
      res.status(403).json({error: true, message: "Authorization header not found"});
      return;
    }
  
    // Verify JWT and check expiration date
    try {
        const secretKey = process.env.SECRET_KEY;
        const decoded = jwt.verify(token, secretKey)  // passed token from above and the secretKey created when logged in
        if (decoded.exp < Date.now()){
            console.log("Token has expired");
            res.status(403).json({error: true, message: "Token has expired"});
            return;
        }
        // Permit user to advance to route as it has not expired
        next();
    } catch (e){
        console.log("Token is not valid: ", e);
        res.status(403).json({error: true, message: "Token is not valid: "+e});
        return;
    }
}

module.exports = authorize;