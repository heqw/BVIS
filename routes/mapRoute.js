
var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

//查询单车站数据，以映射到地图中
router.get('http://localhost:3000/stationData', function (req, res, next) {
    var selectData = function (db, callback) {

        const mydb = db.db('bikeData');
        var collection = mydb.collection('station');
        //查询数据
        //var whereStr = { "station_id": 'BT-03' };
        collection.find({}).toArray(function (err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);//callback回调函数
        });
    }
    MongoClient.connect(url,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
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
