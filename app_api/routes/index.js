var express = require('express');
var router = express.Router();

var jwt = require('express-jwt');
var auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload'
});


var cirlMapping = require('../controllers/mapping');

// Mapping
router.post('/mappings/execute', cirlMapping.mappingsExecute);

module.exports = router;
