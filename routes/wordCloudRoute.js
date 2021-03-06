var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

//在trip里查询单车站数据，以绘制wordCloud
// spiralLine也使用了该路由
router.get('/fromStation', function(req, res, next) {
    var stayear = req.query.startyear;
    var stamonth = req.query.startmonth;
    var staday = req.query.startday;
    var endyear = req.query.endyear;
    var endmonth = req.query.endmonth;
    var endday = req.query.endday;
    var selectData = function(db, callback) {
        const mydb = db.db('bikeData');
        var collection = mydb.collection('trip');
        //查询2014-10-13的数据，需注意mongodb存储的时间比现在时间早8个小时,写的时候要根据想查询的时间加上8
        var whereStr = {
            start_time: {
                $gte: new Date(stayear, stamonth, staday, 8, 0),
                $lte: new Date(endyear, endmonth, endday, 7, 59)
            }
            //"trip_id": '431'
        };

        collection.find(whereStr).toArray(function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result); //callback回调函数
        });
    };


    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true },
        function(err, db) {
            selectData(db, function(result) {
                res.json(result);
                db.close();
            });
        });
});
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
module.exports = router;