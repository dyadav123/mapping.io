
var mongoose = require('mongoose');
var Transaction = mongoose.model('transaction');

// var TRANSACTION_COLLECTION = "transaction";
//
// var app = express();
// app.use(express.static(__dirname + "/public"));
// app.use(bodyParser.json());

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

/*  "/fsTransaction"
 *    POST: insert a transaction
 */

 module.exports.transactionsInsert = function(req, res) {
   Transaction.create(
     {
       partnerType : req.body.partner_type,
       partnerCode : req.body.partner_code,
       createdOn : req.body.createdOn,
       rows : req.body.rows
     },

     function(err,transaction)
     {
       if (err) {
         console.log(err);
         sendJSONresponse(res, 400, err);
       }
       else
       {
         sendJSONresponse(res, 201, transaction);
       }
     }
   );
 };
