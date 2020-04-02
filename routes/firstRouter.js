// var express = require('express');
// var router = express.Router();

// //连库查询形式一，网上教程2
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";
// router.get('/find', (req, res, next) => {
//     MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
//         if (err) throw err;
//         var dbo = db.db("bikeData");
//         var whereStr = { "station_id": 'BT-01' };  // 查询条件
//         dbo.collection("station").find(whereStr).toArray(function (err, result) {
//             if (err) throw err;
//             res.json(result);
//             console.log(result);
//             db.close();
//         });
//     });
// })

// router.get('/', function (req, res, next) {
//     res.render('index', { title: 'Express' });
// });




//连库查询形式二，对应liu
var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

router.get('/find', function (req, res, next) {
    var selectData = function (db, callback) {

        //连接到表。版本问题，如果不连数据库db()，直接连collection会报错
        const mydb = db.db('bikeData');
        var collection = mydb.collection('trip');
        //查询数据
        //var whereStr = { "station_id": 'BT-03' };
        //var whereStr = { "trip_id": '432' };
        collection.find({start_time: {
            $gte: new Date(2014, 9, 27, 8, 0),
            $lte: new Date(2014, 9, 27, 12, 59)
        }}).toArray(function (err, result) {
            if (err) {
                console.log('Error:' + err);
                return;
            }
            callback(result);//callback回调函数
        });
    }
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        //console.log("连接成功！");
        selectData(db, function(result) {
            res.json(result);
            db.close();
        });
    });
});
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
module.exports = router;




//By Liu
// var express = require('express');
// var router = express.Router();

// //首先创建一个 MongoClient 对象
// var MongoClient = require('mongodb').MongoClient;
// //配置好指定的 URL 和 端口号
// var url = "mongodb://localhost:27017/bikeData";

// //设置路由
// router.get('/',(req,res,next) =>{
//     //Express获取路由地址参数的方法:req.query（req.body）
//    // var route_id = req.query.route_id;

//     var data = function(db,callback){ 
//         //连接到表
//         var collection = db.collection('station');
//         //查询数据
//         var whereStr = { "trip_id": '431'}
//         //将查找到的数据转换成标准的数组类型
//         collection.find(whereStr).toArray(function (err, result) {
//             if (err) {
//                 console.log('Error:' + err);
//                 return;
//             }
//             callback(result);//callback回调函数
//         });
//     }
// //程序入口，判断连接数据库是否成功，并将数据转换为需要的json格式；data函数在上方定义了
// MongoClient.connect(url, function (err, db) {
//     console.log("连接成功！");
//     data(db, function (result) {
//         res.json(result);
//         db.close();
//     });
// });
// })


//网上教程
// var express = require('express');
// var router = express.Router();

// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017";

// router.get('/', function (req, res) {

//     var selectData = function (db, callback) {

//         //连接到表
//         var collection = db.collection('station'); 
//         //查询数据
//         var whereStr = { "trip_id": '431' }; 
//         collection.find(whereStr).toArray(function (err, result) {
//             // console.log(error);
//             // return res.json(result);
//             if (err) {
//               console.log('Error:' + err);
//               return;
//            }
//            callback(result);//callback回调函数
//         });
//     }
//     console.log("成功！");
//     MongoClient.connect(url,function (err, db) {
//         console.log("连接成功！");
//         selectData(db, function (result) {
//             res.json(result);
//             console.log(result);
//             db.close();
//         });
//     });
// })
//module.exports = router;


