var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/timeLineData', function(req, res, next) {
    var tstayear = req.query.tstartyear;
    var tstamonth = req.query.tstartmonth;
    var tstaday = req.query.tstartday;
    var tendyear = req.query.tendyear;
    var tendmonth = req.query.tendmonth;
    var tendday = req.query.tendday;
    var selectData = function(db, callback) {

        const mydb = db.db('bikeData');
        var collection = mydb.collection('trip');
        collection.find({
            start_time: {
                $gte: new Date(tstayear, tstamonth, tstaday, 8, 0),
                $lte: new Date(tendyear, tendmonth, tendday, 7, 59)
            }
        }, {
            _id: 0,
            trip_id: false,
            "stop_time": false,
            "bike_id": 0,
            "trip_duration": 0,
            "from_station_name": 0,
            "to_station_name": 0,
            "from_station_id": 0,
            "to_station_id": 0,
            // "user_type":0,
            "gender": 0,
            "birth_year": 0
        }).toArray(function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);
        });
    }
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        selectData(db, function(result) {
            res.json(result);
            db.close();
        });
    });
});
router.get('/timeLineWeather', function(req, res, next) {
    var Wstartyear = req.query.tstartyear;
    var Wstartmonth = req.query.tstartmonth;
    var Wstartday = req.query.tstartday;
    var Wendyear = req.query.tendyear;
    var Wendmonth = req.query.tendmonth;
    var Wendday = req.query.tendday
    var selectData = function(db, callback) {

        const mydb = db.db('bikeData');
        var collection = mydb.collection('weather');
        collection.find({
            Date: {
                $gte: new Date(Wstartyear, Wstartmonth, Wstartday, 8, 0),
                $lte: new Date(Wendyear, Wendmonth, Wendday, 7, 59)
            }
        }).toArray(function(err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);
        });
    }
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
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