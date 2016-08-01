var mongoose = require('mongoose');

var dataType = {
  STRING: "String",
  NUMBER : "Number",
  DECIMAL: "Decimal",
  DATE : "Date"
};

var dataSource = new mongoose.Schema({
  name: String,
  adapter: String,
  _type: String,
  host: String,
  user: String,
  password: String,
  database: String,
  port: Number,
  _get: String,
  _set: String,
  key: [String],
  tkey:[[String]],
});

var rowData = new mongoose.Schema({
  partnerField: String,
  f7Field: String,
  value: String,
  type: {type: dataType}
});

var rows = new mongoose.Schema({
  rowKey: String,
  rowData: [rowData],
});

var transactionSchema = new mongoose.Schema({

  partner_type : String,
  partner_code : String,
  createdOn: {type: Date, "default": Date.now},
  rows: [rows],
  reference: [dataSource],
});

var transactionSchema1 = new mongoose.Schema({

  partner_type : String,
  partner_code : String,
  source : String,
  createdOn: {type: Date, "default": Date.now},
  rows: [rows],
  reference: [dataSource],
  client : String,
  verMajor : String,
  verMinot : String

});

var transactionStackSchema = new mongoose.Schema({
     transactions : [transactionSchema]
});

var filterSchema = new mongoose.Schema({
    columnName : String,
    columnValues : String,
    columnIndex : Number
});

mongoose.model('transactionStack', transactionStackSchema);
mongoose.model('transaction', transactionSchema);
mongoose.model('transactionMain', transactionSchema1);
mongoose.model('transactionRows', rows);
mongoose.model('transactionRowData', rowData);
mongoose.model('transactionFilter', filterSchema);
