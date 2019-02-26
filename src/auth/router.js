'use strict';

const express = require('express');

const paypal = require('paypal-rest-sdk');

const authRouter = express.Router();

const cwd = process.cwd();
const User = require('./user-model.js');
const auth = require('./middleware.js');


const addresses = {
  ucla: {
    client_id: 'AWjEaYQGjQb99IhkxZFa79SQSuBx6Z_J83RSBhkmVB9RWpIpLd4TI5yI9psWXE32YXvjSi1Pgcexi0kK',
    client_secret: 'EJus2Ylo66CauLOaPycnHiMB8efYElRTytNxw6bSbyhoH70jgpUO0HnIp6t6BOlDk6CMHJHEYbQ4ezyO'
  },
  apple:{
    client_id: 'AWjEaYQGjQb99IhkxZFa79SQSuBx6Z_J83RSBhkmVB9RWpIpLd4TI5yI9psWXE32YXvjSi1Pgcexi0kK',
    client_secret: 'EJus2Ylo66CauLOaPycnHiMB8efYElRTytNxw6bSbyhoH70jgpUO0HnIp6t6BOlDk6CMHJHEYbQ4ezyO'
  }
};

let amount;

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AWjEaYQGjQb99IhkxZFa79SQSuBx6Z_J83RSBhkmVB9RWpIpLd4TI5yI9psWXE32YXvjSi1Pgcexi0kK',
  'client_secret': 'EJus2Ylo66CauLOaPycnHiMB8efYElRTytNxw6bSbyhoH70jgpUO0HnIp6t6BOlDk6CMHJHEYbQ4ezyO'
});


authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  console.log('🔱');
  user.save()
    .then( (user) => {
      User.findOne({_id: user._id})
        .then(user => {
          req.token = user.generateToken();
          req.user = user;
          res.set('token', req.token);
          res.cookie('auth', req.token);
          res.send(req.token);
        })
    })
    .catch(next);
})

authRouter.post('/signin', auth(), (req, res, next) => {
  console.log('🎇');
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.post('/key', auth, (req, res, next) => {
  let key = req.user.generateToken();
  res.status(200).send(key);
});


authRouter.post('/pay', (req, res, next) => {
  console.log(req.body);
  amount = req.body.amount;
  let item = req.body.item;
  console.log(amount);
  console.log(item);
  
  // let recipient = address[req.body.recipient];
  // let fundmeId = req.body.fundmeId;
  let payjson = `{
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:8080/success",
        "cancel_url": "http://localhost:8080/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "PluralSight",
                "sku": "001",
                "price": "${amount}",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "${amount}"
        },
        "description": "${item}"
    }]
  };`

  // res send to client
  // paylink + payjson

  paypal.payment.create(payjson, function (error, payment) {
    console.log('📛');
    if (error) {
        throw error;
    } else {
        for(let i =0; i < payment.links.length; i++){
            if(payment.links[i].rel === 'approval_url'){
                res.redirect(payment.links[i].href); 
                // res.send(payment.links[i].href);
            }
        }
    }
  });

})


authRouter.get('/success', (req,res)=>{
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json ={
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": amount
          }
      }]
  };
  
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment){
      if(error){
          console.log(error.response);
          throw error;
      }
      else{
        // adk provider api for token
        // res send client that token
        res.send('success');
      }
  })
})

authRouter.get('/cancel', (req,res)=> res.send('Cancelled'))

module.exports = authRouter;