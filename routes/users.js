const express = require('express');
const router = express.Router();
const axios = require('axios');
// var authed = require('../authed/authed.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/register', function(req, res, next){
  const email = req.body.email;
  const password = req.body.password;
  const filter ={
   "email": email 
  }
  console.log(email, password);
  console.log(req.body);
  // Verify body
  if (!email || !password || !Object.keys(req.body).includes('email') || !Object.keys(req.body).includes('password')){
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    });
    return;
  }
  // Determine if user already exists in table
  const queryUsers = req.db.from("users").select("*").where(filter);
  queryUsers
    .then((users) => {
      if (users.length > 0){
        console.log("User already exists!");
        res.status(409).json({error: true, message: "Request body incomplete - email and password needed"});
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

router.post('/login', function(req, res, next){
  const email = req.body.email;
  const password = req.body.password;
  const filter ={
    "email": email 
   }
  // Verify body
  if (!email || !password){
    res.status(400).json({
      error: true,
      message: "Request body invalid - email and password are required"
    })
    return;
  }
  const queryUsers = req.db.from("users").select("*").where(filter);
  queryUsers
    .then((users) => {
      if (users.length == 0){
        console.log("User does not exist");
        res.status(401).json({error: true, message: "User does not exist"});
        return;
      }
      // Compare password hashes
      const user = users[0];
      return bcrypt.compare(password, user.hash);
    })
    .then((match) => {
      if (!match){
        console.log("Passwords do not match");
        res.status(401).json({error: true, message: "Incorrect email or password"});
        return;
      }

      // Passwords match
      // Create and return JWT token
      const secretKey = process.env.SECRET_KEY;
      console.log(secretKey);
      const expires_in = 60*60*24; // 1 Day
      const exp = Date.now() + expires_in * 1000; //milliseconds
      const token  = jwt.sign({email, exp}, secretKey);
      // res.status(200).json({token_type: "Bearer", token, expires_in});
      res.json({token_type: "Bearer", token, expires_in});
    })
})

module.exports = router;
