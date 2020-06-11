var express = require('express');
var router = express.Router();
const axios = require('axios');
var authed = require('../authed/authed.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next){
  axios.post('http://131.181.190.87:3005/user/register', {
    email: "example@api.com",
    password: "asdlkfj1"
  })
  .then((response) => {
    console.log(response);
    //ex) {
    //   "success": true,
    //   "message": "User created"
    // }
    res.send({"Error":false, "Message":"Success", "data":response.data});
  })
  .catch((err) => {
    console.log(err);
    // res.json(err);
  })
});

router.get('/login', function(req, res, next){
  axios.post('http://131.181.190.87:3005/user/login', {
    email: "example@api.com",
    password: "asdlkfj1"
  })
  .then((response) => {
    console.log(response);
    //ex) {
    //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3Q5QHRlc3QuY29tIiwiZXhwIjoxNTkxOTUyODM5LCJpYXQiOjE1OTE4NjY0Mzl9.qFlnzC4lrawTaEEVYQNEtBjX_v4Oa1msl30NpsTF7gw",
    //   "token_type": "Bearer",
    //   "expires_in": 86400
    // }
    // let userInfo = response.data;
    // authed.setUserInfo(response.data);
    authed.setUserInfo("OK");
    res.json({"Error":false, "Message":"Success", "data":response.data});
  })
  .catch((err) => {
    console.log(err);
    // res.json(err);
  })
});

module.exports = router;
