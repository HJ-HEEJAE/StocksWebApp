const express = require('express');
const router = express.Router();
const axios = require('axios');
var authed = require('../authed/authed.js');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// router.get('/register', function(req, res, next){
//   axios.post('http://131.181.190.87:3005/user/register', {
//     email: "example@api.com",
//     password: "asdlkfj1"
//   })
//   .then((response) => {
//     console.log(response);
//     //ex) {
//     //   "success": true,
//     //   "message": "User created"
//     // }
//     res.send({"Error":false, "Message":"Success", "data":response.data});
//   })
//   .catch((err) => {
//     console.log(err);
//     // res.json(err);
//   })
// });

router.post('/register', function(req, res, next){
  const email = req.body.email;
  const password = req.body.password;
  // Verify body
  if (!email || !password){
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    });
    return;
  }
  // Determine if user already exists in table
  const queryUsers = req.db.from("users").select("*").where("email","=",email);
  queryUsers
    .then((users) => {
      if (users.length > 0){
        console.log("User already exists!");
        return;
      }
      // Insert user into DB
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      return req.db.from("users").insert({email, hash});
    })
    .then(() => {
      console.log("Successfully inserted user");
      res.status(201).json({success:true, message: "User created"});
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
