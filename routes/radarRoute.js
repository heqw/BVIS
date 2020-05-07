var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/spiralLineData', function(req, res, next) {
    var stayear = req.query.sstartyear;
    var stamonth = req.query.sstartmonth;
    var staday = req.query.sstartday;
    var endyear = req.query.sendyear;
    var endmonth = req.query.sendmonth;
    var endday = req.query.sendday;
    var station_id = req.query.sration_id;
    var selectData = function(db, callback) {
        const mydb = db.db('bikeData');
        var collection = mydb.collection('trip');

        collection.find({
            "from_station_id": station_id,
            "to_station_id": station_id,
            start_time: {
                $gte: new Date(stayear, stamonth, staday, 8, 0),
                $lte: new Date(endyear, endmonth, endday, 7, 59)
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