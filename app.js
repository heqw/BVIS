//require('./public/javascripts/db');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var ejs = require('ejs');//html模板引擎设置

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//first连接
var fr = require('./routes/firstRouter');
var maprouter = require('./routes/mapRoute');
var wordCloudrouter = require('./routes/wordCloudRoute');
var timeLinerouter = require('./routes/timeLineRoute');
var spiralLinerouter = require('./routes/spiralLineRoute');
var getInforouter = require('./routes/getInfoRoute');

var app = express();

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization,Content-Type,Depth, User-Agent,X-File-Size, X-Requested-With, X-Requested-By, If-Modified-Since, X-File-Name, X-File-Type, Cache-Control, Origin");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,PATCH,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1');
  res.header('Access-Control-Allow-Credentials', true);
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});





// view engine setup
app.set('views', path.join(__dirname, 'views'));
//将EJS模板映射至".html"文件
app.engine('html', ejs.__express);
//没有指定文件模板格式时，默认使用的引擎插件
app.set('view engine', 'html');
//first连接
app.use('/',fr);
app.use('/', maprouter);
app.use('/', wordCloudrouter);
app.use('/', timeLinerouter);
app.use('/', getInforouter);
app.use('/', spiralLinerouter);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;

// app.js

// var mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/blog')     //连接本地数据库blog 

// var db = mongoose.connection;

// // 连接成功
// db.on('open', function () {
//   console.log('MongoDB Connection Successed');
// });
// // 连接失败
// db.on('error', function () {
//   console.log('MongoDB Connection Error');
// });
