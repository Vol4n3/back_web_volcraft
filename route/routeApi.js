let express = require('express');
let router = express.Router();
let User = require('../controller/userController');
router.get('/', function (req, res) {
    return res.json({title: 'Home'});
});
router.post('/users', function (req, res) {
    let body = req.body;


});
module.exports = router;