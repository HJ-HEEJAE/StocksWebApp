const express = require('express');
const router = express.Router();
// var authed = require('../authed/authed.js');
var authorize = require('../authorize.js');

router.get('/', function(req, res, next) {
  // res.render('index', { title: 'The assignment 2' });
  res.redirect('/stocks/symbols');
});

router.get('/stocks/symbols', function(req, res, next) {
  let industry = req.query.industry;
  // console.log(industry);
  if (industry == undefined){
    if (Object.keys(req.query).length != 0){
      res.status(400).json({error: true, message: "Invalid query parameter: only 'industry' is permitted"});
      return;
    }else{
      req.db.from('stocks').select("name", "symbol", "industry")
      .then((rows) => {
        console.log(rows.length);
        if (rows.length > 0){
          res.status(200).json(rows);
          return;
        }
      })
      .catch((err) => {
        console.log(err); 
        // throw err;
        res.status(500).json({error: true, message: "Error executing MySQL query: "+err});
        return;
      })
    }
  // The case of there's a query string
  }else{
    req.db.from('stocks').select("name", "symbol", "industry").where('industry','LIKE','%'+industry+'%')
    .then((rows) => {
      if (rows.length > 0){
        console.log(rows);
        res.status(200).json(rows);
        return;
      }else{
        res.status(404).json({error: true, message: "Industry sector not found"});
        return;
      }
    })
    .catch((err) => {
      console.log(err); 
      // throw err;
      res.status(500).json({error: true, message: "Error executing MySQL query: "+err});
      return;
    })
  }
});

router.get('/stocks/:symbol', function(req, res, next){
  let symbol = req.params.symbol;
  console.log(symbol);
  if (Object.keys(req.query).length != 0){
    res.status(400).json({error: true, message: "Date parameters only available on authenticated route /stocks/authed"});
    return;
  }else{
    const regEx = /^[A-Z]{1,5}$/;
    if (!symbol.match(regEx)){
      res.status(400).json({error: true, message: "Stock symbol incorrect format - must be 1-5 capital letters"});
    }else{
      const filter = {
        "symbol": symbol
      }
      req.db.from('stocks').select('*').where(filter).orderBy('timestamp', 'desc').limit(1)
      .then((rows) => {
        if (rows.length > 0){
          res.status(200).json(rows[0]);
          return;
        }else{
          res.status(404).json({error: true, message: "No entry for symbol in stocks database"});
          return;
          // OR res.json("Stock symbol incorrect format - must be 1-5 capital letters");
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({error: true, message: "Error executing MySQL query: "+err});
        return;
      })
      
    }
  }
});

// with authorization
router.get('/stocks/authed/:symbol', authorize, function(req, res, next){
  let symbol = req.params.symbol;
  let fromdate = req.query.from;
  let todate = req.query.to;
    const filter = {
      "symbol": symbol
    };
    let query = null;
    if (!fromdate && !todate){
      if (Object.keys(req.query).length > 0){
        res.status(400).json({error: true, message: "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"});
        return;
      }
      query = req.db.from('stocks').select('*').where(filter).orderBy('timestamp', 'desc').limit(1);

    }else{
      if (!Date.parse(fromdate) && !Date.parse(todate)){
        res.status(400).json({error: true, message: "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"});
        return;

      }else if (Date.parse(fromdate) && Date.parse(todate)){
        if (Object.keys(req.query).length > 2){
          res.status(400).json({error: true, message: "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"});
          return;
        }
        query = req.db.from('stocks').select('*').where(filter).andWhere('timestamp','>=',fromdate).andWhere('timestamp','<=',todate)
        
      } else if (Date.parse(fromdate) && !todate){
        if (Object.keys(req.query).length > 1){
          res.status(400).json({error: true, message: "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"});
          return;
        }
        query = req.db.from('stocks').select('*').where(filter).andWhere('timestamp','>=',fromdate).andWhere('timestamp','<','2020-03-25')
  
      } else if (!fromdate && Date.parse(todate)){
        if (Object.keys(req.query).length > 1){
          res.status(400).json({error: true, message: "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"});
          return;
        }
        query = req.db.from('stocks').select('*').where(filter).andWhere('timestamp','>=','2019-11-06').andWhere('timestamp','<=',todate)
        
      }
    } 
    query
      .then((rows) => {
        // console.log(rows);
        if (rows.length > 0){
          res.status(200).json(rows);
          return;
        }else{
          res.status(404).json({error: true, message: "No entries available for query symbol for supplied date range"});
          return;
        }
      })
      .catch((err) => {
        res.status(500).json({error: true, message: "Error executing MySQL query: "+err});
        return;
      })
});

module.exports = router;
