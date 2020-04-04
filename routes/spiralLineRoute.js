var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/spiralLineData', function (req, res, next) {
    var selectData = function (db, callback) {
        const mydb = db.db('bikeData');
        var collection = mydb.collection('trip');
        //查询数据
        //var whereStr = { "station_id": 'BT-03' };
        collection.find({
            start_time: {
                $gte: new Date(2014, 9, 13, 8, 0),
                $lte: new Date(2014, 9, 14, 7, 59)
            }
        }).toArray(function (err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);
        });
    }
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        selectData(db, function (result) {
            res.json(result);
            db.close();
        });
    });
});
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
module.exports = router;
