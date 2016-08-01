var mysql = require("mysql");
var redis = require('redis');
var config = require('config');

var redisConfig = config.get('redis');

// var client = redis.createClient(redisConfig.port, redisConfig.host);
// client.on('connect', function() {
//     console.log('connected');
// });
//
// client.get('complete', function(err, value) {
//     console.log(value);
//     if (value != true)
//     {
//       var mySqlConfig = config.get('mySql');
//
//       var conn = mysql.createConnection({
//         host: mySqlConfig.host,
//         user: mySqlConfig.user,
//         password: mySqlConfig.password,
//         database: mySqlConfig.database
//       });
//
//       conn.connect(function(err){
//         if(err){
//           console.log('Error connecting to Db');
//           return;
//         }
//         console.log('Connection established');
//       });
//       conn.query(mySqlConfig.qReadCache, function(err, rows, fields) {
//         if(err) throw err;
//
//         console.log('Data received from Db:\n');
//
//         // console.log(rows);
//         rows.forEach(function(row) {
//           var obj = {};
//           fields.forEach(function(field) {
//             obj[field.name] = row[field.name] != null ? row[field.name] : '';
//             // console.log(field.name + ': ' + row[field.name]);
//           });
//           // console.log(obj);
//           client.hmset(row[mySqlConfig.qKey] + '_' + row['id'], obj);
//           var list = [];
//           list[0] = row[mySqlConfig.qKey];
//           list.push(row['id']);
//           client.sadd(list, function(err, arr) {
//             // console.log('test');
//           });
//           // client.lrange(row[mySqlConfig.qKey], 0, -1, function(err, ids) {
//           //   var list = [];
//           //   list[0] = row[mySqlConfig.qKey];
//           //   list.concat(ids);
//           //   list.push(row['id']);
//           //   console.log(list);
//           //   client.rpush(list, function(err, arr) {
//           //     // console.log(arr);
//           //   });
//           // });
//         });
//       });
//
//     }
//     client.set('complete', true, function(err, value) {})
//     client.hgetall('000027b1-f5ca-4fb5-832c-d15403e0cb2a_86', function(err, object) {
//         console.log(object);
//     });
//
//     client.smembers('056dc5d4-0588-43d4-948c-115a1166ad60', function(err, ids) {
//       console.log(ids);
//     });
// });
//

var gracefulShutdown;



// conn.end(function(err) {
//   // The connection is terminated gracefully
//   // Ensures all previously enqueued queries are still
//   // before sending a COM_QUIT packet to the MySQL server.
// });

var mongoose = require('mongoose');
var gracefulShutdown;

var mongoConfig = config.get('mongo');

var mongoURI = mongoConfig.host;

mongoose.connect(mongoURI);

// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + mongoURI);
});
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};
// For nodemon restartsser
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});
// For app termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});
// For Heroku app termination
process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app termination', function() {
        process.exit(0);
    });
});


// BRING IN YOUR SCHEMAS & MODELS
require('./users');
require('./transaction');
