
// Declare depencencies
var mongoose = require('mongoose');
var Transaction = mongoose.model('transaction');
var TransactionRows = mongoose.model('transactionRows');
var Client = require('node-rest-client').Client;

var ftp = require('ftp');
var mysql = require("mysql");
var config = require('config');
var redis = require('redis');
var config = require('config');
var kafka = require('kafka-node');
var fs = require('fs');
var lineReader = require('line-reader');
var path = require( 'path' );
var processor = require( "process" );

var retOutputObj;

// Create JsonResponse
var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

// Create global variables
var redisConfig;
var client;
var CacheKeys = [];
var response;
//mongoose module for creating ingestion scheme
module.exports.mappingsExecute = function(req, res) {
  var transaction =
    {
      partner_type : req.body.partner_type,
      partner_code : req.body.partner_code,
      createdOn : req.body.createdOn,
      rows : req.body.rows,
      client: req.body.client,
      verMajor : req.body.majVer,
      verMinor : req.body.minVer
    };

    response = res;
    mapData(transaction);

};

// perform data matching and extract on the data from the file
var mapData = function(transaction)
{
  var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzhlN2ViZTE1MzdlNDFhMjQzYzNhOWMiLCJlbWFpbCI6ImR5YWRhdkBmdXNpb25zZXZlbi5jb20iLCJuYW1lIjoiZHlhZGF2IiwiZXhwIjoxNDcwMTU0ODQ1LCJpYXQiOjE0Njk1NTAwNDV9.8KRbFW6zJCQIneePYfHwKkFZvpMNKG1ZlpeBPbAYcKk";
  var contract = {};
  var partner;
  var colArray = [];
  var filterArray = [];
  var staticArray = [];
  var partnerCode;
  var partnerType
  var source;
  var contractConfig = config.get('contractConfig');

  commonGet(contractConfig.uri +
    '?client.code=' + transaction.client +
    '&version.major=' + transaction.verMajor +
    '&version.minor=' + transaction.verMinor, token, function(res)
    {
      contract = res[0]; // since the returned object is a collection, we need to extract the 1st element
    //  console.log('contract ' + contract);
    partnerType = transaction.partner_type;

    if(partnerType == "FPA")
    {
       source = partnerCode = transaction.partner_code;
    }
    else
    {
      source = transaction.partner_code;
    }

     partner = contract.partner.find(x=> x.code == source);

    var mappingInfo;
    if(partner != undefined)
    {
       mappingInfo = partner.mapping;
    }

      var newRows = [];
      transaction.rows.forEach(function(rows)
      {
        var newRowData = [];
        rows.rowData.forEach(function(rowData)
        {
            if(mappingInfo != undefined)
             {
               console.log(mappingInfo);
               var item = mappingInfo.fields.find(x => x.partner_field.toLowerCase() == rowData.partnerField.toLowerCase());
               if(item != undefined)
                 rowData.f7Field = item.fs_field;
               newRowData.push(rowData);
             }
         });

         var rowInfo = new TransactionRows();
         rowInfo.rowKey = rows.rowKey;
         rowInfo.rowData = newRowData;
         newRows.push(rowInfo);
      });

       transaction.rows = newRows;
       transaction.partner_type = partnerType;
       transaction.partner_code = partnerCode;
       transaction.reference = [];
       sendJSONresponse(response, 201, transaction);

    });
}

var callContract = function(callback)
{
  var contractConfig = config.get('contractConfig');
  commonGet(contractConfig.uri + '?client.code=RICH&version.major=1', "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzhlN2ViZTE1MzdlNDFhMjQzYzNhOWMiLCJlbWFpbCI6ImR5YWRhdkBmdXNpb25zZXZlbi5jb20iLCJuYW1lIjoiZHlhZGF2IiwiZXhwIjoxNDY5ODMxNTAzLCJpYXQiOjE0NjkyMjY3MDN9.C1u4XD2k06z-VWMecp3e-hRmdYfqPNskinKhrq5QbxY", function(res)
  {
      callback(res);
  });
}

var commonGet = function(endpoint, token, callback)
{
  var client = new Client();

  // set content-type header and data as json in args parameter
  var args = {
      headers: { "Content-Type": "application/json" }
  };

  if (token != null)
    args.headers.Authorization = "Bearer " + token;

  client.get(endpoint, args, function (data, response) {
      callback(data);
  });
}


// create cache object

// var createAndExtractCache = function(transaction)
// {
//   if(CacheKeys.length == 0)
//   {
//     redisConfig = config.get('redis');
//
//     client = redis.createClient(redisConfig.port, redisConfig.host);
//     client.on('connect', function() {
//
//           // ingestion.mappings.forEach(function(mapping)
//           // {
//             transaction.reference.forEach(function(reference)
//             {
//               client.get('complete', function(err, value)
//               {
//                 {
//
//                   var conn = mysql.createConnection({
//                     host: reference.host,
//                     user: reference.user,
//                     password: reference.password,
//                     database: reference.database,
//                     port: reference.port
//                   });
//
//                   conn.connect(function(err)
//                   {
//                     if(err)
//                     {
//                       console.log('Error connecting to Db');
//                       return;
//                     }
//                   });
//
//                   conn.query(reference._get, function(err, rows, fields)
//                   {
//                     console.log("connecting");
//                     if(err) throw err;
//                     rows.forEach(function(row)
//                     {
//                       var obj = {};
//                       var cacheKey = "";
//                       fields.forEach(function(field)
//                       {
//                         obj[field.name] = row[field.name] != null ? row[field.name] : '';
//                         reference.key.forEach(function(key)
//                         {
//                           if (field.name == key)
//                             cacheKey += "#" + row[field.name];
//                         });
//                       });
//                       client.hmset(cacheKey, obj);
//                       CacheKeys.push(cacheKey);
//                     });
//                     console.log("call map data with new cache");
//                        extractData(transaction);
//                   });
//                 }
//               });
//             });
//         //  });
//     });
//   }
//
//   else {
//     console.log("call map data without new cache");
//     extractData(transaction);
//   }
// }
