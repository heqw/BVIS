
var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

//在trip里查询单车站数据，以绘制wordCloud
router.get('/fromStation', function (req, res, next) {
    var selectData = function (db, callback) {

        const mydb = db.db('bikeData');
        var collection = mydb.collection('trip');
        //查询2014-10-13的数据，需注意mongodb存储的时间比现在时间早8个小时,写的时候要根据想查询的时间加上8
        var whereStr = {
            "start_time": {
                $gte: new Date(2014, 9, 13, 8, 0),
                $lte: new Date(2014, 9, 14, 7, 59)
            }
            //"trip_id": '431'
        };
            
        collection.find(whereStr).toArray(function (err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);//callback回调函数
        });
    };

    
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
