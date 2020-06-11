var express = require('express');
var router = express.Router();
var authed = require('../authed/authed.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The assignment 2' });
});

router.get('/app', function(req, res, next) {
  res.render('index', { title: 'Lots of routes available' });
});

router.get('/stocks/symbols', function(req, res, next) {
  console.log(11111);
  let industry = req.query.industry;
  console.log(industry);
  // req.db.raw("SELECT VERSION()").then(
  if (industry == undefined){
    req.db.from('stocks').select("name", "symbol", "industry")
    .then((rows) => {
      console.log(rows);
      res.json({"Error":false, "Message":"Success", "Stocks":rows})
    })
    .catch((err) => {
      console.log(err); 
      // throw err;
      res.json({"Error":true, "Message":"Error executing MySQL query"})
    })
  // The case of there's a query string
  }else{
    req.db.from('stocks').select("name", "symbol", "industry").where('industry','LIKE','%'+req.query.industry+'%')
    .then((rows) => {
      if (rows.length > 0){
        console.log(rows);
        res.json({"Error":false, "Message":"Success", "Stocks":rows})
      }else{
        res.json("Industry sector not found.");
      }
    })
    .catch((err) => {
      console.log(err); 
      // throw err;
      res.json({"Error":true, "Message":"Error executing MySQL query"})
    })
    // res.send("Version Logged successfully");
  }
});

router.get('/stocks/:symbol', function(req, res, next){
  console.log(22222);
  console.log(req.params.symbol);
  let symbol = req.params.symbol;
  // Not found 화면 만들기
  req.db.from('stocks').select('*').where('symbol','=',req.params.symbol)
  .then((rows) => {
    if (rows.length > 0){
      res.json({"Error":false, "Message":"Success", "Stocks":rows})
    }else{
      res.json("No entry for symbol in stocks database.");
      // OR res.json("Stock symbol incorrect format - must be 1-5 capital letters");
    }
  })
  .catch((err) => {
    console.log(err);
    res.json({"Error":true, "Message":"Error executing MySQL query"})
  })
});

router.get('/stocks/authed/:symbol', function(req, res, next){
  if (authed.authenticateUser(authed.userInfo)){
    let symbol = req.params.symbol;
    let fromdate = req.query.from;
    let todate = req.query.to;
    console.log(fromdate, todate, typeof todate);
    req.db.from('stocks').select('*').where('symbol','=',symbol).andWhere('timestamp','>=',fromdate).andWhere('timestamp','<',todate)
    .then((rows) => {
      console.log(rows);
      res.json({"Error":false, "Message":"Success", "Stocks":rows})
    })
    .catch((err) => {
      res.json({"Error":true, "Message":"Error executing MySQL query"})
    })
  }else{
    res.redirect('/stocks/symbols');
  }

});

module.exports = router;
