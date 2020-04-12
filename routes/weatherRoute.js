var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/weatherData', function(req, res, next) {
    var Wstartyear = req.query.Wstartyear;
    var Wstartmonth = req.query.Wstartmonth;
    var Wendyear = req.query.Wendyear;
    var Wendmonth = req.query.Wendmonth;
    var selectData = function(db, callback) {

        const mydb = db.db('bikeData');
        var collection = mydb.collection('weather');
        collection.find({
            Date: {
                $gte: new Date(Wstartyear, Wstartmonth, 1),
                $lte: new Date(Wendyear, Wendmonth, 1)
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


router.get('/weatherStation', function(req, res, next) {
    var startyear = req.query.startyear;
    var startmonth = req.query.startmonth;
    var endyear = req.query.endyear;
    var endmonth = req.query.endmonth;
    var selectData = function(db, callback) {

        const mydb = db.db('bikeData');
        var collection = mydb.collection('trip');
        collection.find({
            start_time: {
                $gte: new Date(startyear, startmonth, 1),
                $lte: new Date(endyear, endmonth, 1)
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


router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
module.exports = router;