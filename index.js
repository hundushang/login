var express = require('express');
var session = require('express-session');
var querystring = require('querystring');
//var util = require('util');
var mysql   = require('mysql');
var fs = require("fs");
var app = express();


// 按照上面的解释，设置 session 的可选参数
app.use(session({
  secret: 'login session',
  cookie: { maxAge: 60 * 1000 }//60秒过期
}));

//链接数据库
var connection = mysql.createConnection({
 host   : 'localhost',
 user   : 'root',
 password : '',
 database : 'mytest'
});
connection.connect();

app.get('/', function (req, res) {
   res.send("index" );
})
app.get('/login', function (req, res) {
  fs.readFile(__dirname + "/" + "index.html", function (err, data) {
     if (err) {
         return console.error(err);
     }
     res.send(data.toString());
  });

   // res.sendFile( __dirname + "/" + "index.html", function(){
   //  res.render('login',{title:'login'})
   // });
})

//创建用户表
app.get('/createt_userinfo', function (req, res) {
  var sql = 'create table t_userinfo (ID int, username varchar(20), password varchar(20))';
  connection.query(sql, function(err, rows, fields){
     if (err){
      throw err;
     }else{
      console.log('t_userinfo创建成功！');
      res.send("t_userinfo创建成功！" );
     }
    
  });
})
app.get('/register', function (req, res) {
  fs.readFile(__dirname + "/" + "register.html", function (err, data) {
     if (err) {
         return console.error(err);
     }
     res.send(data.toString());
  });
})
app.post('/register', function (req, res) {
  var post = '';
    req.on("data",function(data){
        post += data;
        console.log(post);
    });
    req.on("end",function(){
        post = querystring.parse(post);
        var reshtml = '',
            registerstate = '0';
        connection.query('select count(*) from t_userinfo' , function(err, rows, fields){
         if (err){
          throw err;
         }
         if (rows){
          var ID = rows[0]['count(*)'] + 1;
          connection.query('insert into t_userinfo (ID,username,password) values ("'+ID+'","'+post['username']+'","'+post['password']+'")' , function selectTable(err, rows, fields){
           if (err){
            throw err;
           }
           console.log(rows);
           if (rows){
            registerstate = '1';
            res.end(registerstate);
            //connection.end();
           }
          });
         }
        });
        
    })
})
//退出登录
app.post('/exit', function (req, res) {
  var post = '';
  var result = '0';
    req.on("data",function(data){
        post += data;
    });
    req.on("end",function(){
        post = querystring.parse(post);
        req.session.username = null;
        result = '1';
        res.end(result);
    })
})
app.get('/main', function (req, res) {
  if (!req.session.username) {
    res.redirect('./login');
  }else{
    fs.readFile(__dirname + "/" + "main.html", function (err, data) {
       if (err) {
           return console.error(err);
       }
       res.send(data.toString());
    });
  }
  // fs.readFile(__dirname + "/" + "index.html", function (err, data) {
  //    if (err) {
  //        return console.error(err);
  //    }
  //    res.send(data.toString());
  // });
})
//登录接口
app.post('/checklogin', function (req, res) {
   var post = '';
    req.on("data",function(data){
        post += data;
        console.log(post);
    });
    req.on("end",function(){
        post = querystring.parse(post);
        var reshtml = '',
            loginstate = '0';
        connection.query('select password from t_userinfo where username="'+post['username']+'"' , function selectTable(err, rows, fields){
         if (err){
          throw err;
         }
         console.log(rows);
         if (rows){
          for(var i = 0 ; i < rows.length ; i++){
            reshtml+='password:'+rows[i].password;
            //比对
            if(post['password'] == rows[i].password){
              loginstate = '1';
              req.session.username = post['username'];
              console.log('用户'+post['username']+'登录成功！');
            }else{
              console.log('用户'+post['username']+'登录失败！');
            }
            //console.log(reshtml);
          }
          res.end(loginstate);
          //connection.end();
         }
        });
    })
})
var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://localhost", host, port, '/register')

})