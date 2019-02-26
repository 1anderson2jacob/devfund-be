'use strict';

const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

// 
// error handeling middleware lives here

const errorHandler = require( './middleware/500.js');
const notFound = require( './middleware/404.js' );

const router = require('./api/routes');
const authRouter = require('./auth/router');


app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(router);
app.use(authRouter);

// error handlers
app.use(notFound);
app.use(errorHandler);


let isRunning = false;

module.exports = {
  server: app,
  start: (port) => {
    if( ! isRunning ) {
      app.listen(port, () => {
        isRunning = true;
        console.log(`Server Up on ${port}`);
      });
    }
    else {
      console.log('Server is already running');
    }
  },
};
