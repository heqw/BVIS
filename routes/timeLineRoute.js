var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/timeLineData', function (req, res, next) {
    var selectData = function (db, callback) {

        const mydb = db.db('bikeData');
        var collection = mydb.collection('trip');
        collection.find({
            start_time: {
                $gte: new Date(2014, 9, 13, 8, 0),
                $lte: new Date(2014, 9, 20, 7, 59)
            }
        },
            {
                _id: 0,
                trip_id:false,
                "stop_time":false,
                "bike_id": 0,
                "trip_duration":0,
                "from_station_name":0,
                "to_station_name":0,
                "from_station_id":0,
                "to_station_id":0,
                "user_type":0,
                "gender":0,
                "birth_year":0
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
