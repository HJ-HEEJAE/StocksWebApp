let authed = {};
authed.userInfo = "";
authed.setUserInfo = function (data){
    authed.userInfo = data;
}

authed.authenticateUser = function(data){
    // function(req, res, next){
    // if (req.isAuthenticated() && await checkIp(req)) {
    //     setBackOfficeHistory(req)
    //     return next();
    if (data = authed.userInfo){
        return true;
    }
    else{
        return false;
    }
}

module.exports = authed;