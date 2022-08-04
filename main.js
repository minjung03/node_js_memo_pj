// 미들웨어 추가
var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var express = require('express');
var static = require('serve-static');
var path = require("path");
var bodyParser = require('body-parser');
// 모듈 추출
var mysql = require('mysql'); 


// express 서버 실행
var app = express();
app.set('port', process.env.PORT || 4444);

app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(bodyParser.json());

// 데이터베이스와 연결
var client = mysql.createConnection({
    user: 'root',
    password: '111111',
    database: 'nodejs'
});

// 서버 실행
app.listen(app.get('port'), function(){
    console.log('server running at http//127.0.0.1:4444...')
});

app.use('/style', express.static(__dirname+'/style'));

// 사용자 id 저장 변수
var userId;
var userName;


// ----------------------시작 / 로그인&회원가입----------------------
app.get('/', function(req, res){ 
    fs.readFile('index.html', 'utf8', function(error, data){
       res.send(data);
    });
});

// 회원 가입
app.get('/register', function(req, res){ 
    fs.readFile('html/register.html', 'utf8', function(error, data){
       res.send(data);
    });
});
app.post('/register', function(req, res){ 
    var body = req.body;
    client.query('insert into user(id, pass, name) values (?,?,?)',
    [body.id, body.pass, body.name], function(){
        res.redirect('/');
    });
});

// 로그인 
app.post('/login', function(req, res){ 
    var parmId = req.body.id; 
    var parmPass = req.body.pass;
    console.log('요청 파라미터 : '+parmId+', '+parmPass);

    client.query('select * from user', function(err, results){
        for (var i = 0; i <= results.length; i++) {

            if(i == results.length){
                res.writeHead(200, {'Content-Type' : 'text/html;charset=utf-8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
                res.write('<a href="/"> 다시 로그인하기 </a>');
                res.end();
                return;
            }            
            else if(results[i].id == parmId && results[i].pass == parmPass) {
                userId = parmId;
                client.query('select * from user where id = ?;', parmId, function(err, result){
                    userName = result[0].name;
                });
                let userName = '';
                client.query('select * from user where id = ?;', parmId, function(err, result){
                    userName = result[0].name;
                });

                fs.readFile('html/list.html', 'utf8', function(error, data){
                    client.query('select * from memo where id = ?',parmId, function(err, result){
                        res.send(ejs.render(data, {
                            data : result,
                            name: userName,

                        })); 
                    });
                });
                return;
            }
        }
    });    
});

// ----------------------메모 목록----------------------
app.get('/list', function(req, res){
    fs.readFile('html/list.html', 'utf8', function(error, data){
        client.query('select * from memo where id = ?', userId, function(err, result){
            res.send(ejs.render(data, {
                data : result,
                name : userName
            })); 
        });
    });
});

// ----------------------메모 상세----------------------
app.get('/detail/:num', function(req, res){ 
    fs.readFile('html/detail.html', 'utf8', function(error, data){
        client.query('select * from memo where post_num = ?', [req.params.num] , function(err, result){
            res.send(ejs.render(data, {
                data : result,
                name : userName
            })); 
        });
    });
});


// ----------------------메모 저장----------------------
app.get('/add', function(req, res){ 
    fs.readFile('html/add.html', 'utf8', function(error, data){
       res.send(data);
    });
});
app.post('/add', function(req, res){ 
    console.log(userId);

    var body = req.body;
    client.query('insert into memo(title, date, content, id) values (?,?,?,?)',
    [body.title, body.date, body.content, userId], function(){
        console.log('--------데이터가 추가되었습니다.');
    });
});

// ----------------------메모 삭제----------------------
app.get('/delete/:num', function(req, res){
    client.query('delete from memo where post_num=?', [req.params.num], function(){
        res.redirect('/');
    });
});

// ----------------------메모 수정----------------------
app.get('/update/:num', function(req, res){
    fs.readFile('html/update.html', 'utf8', function(error, data){
        client.query('select * from memo where post_num = ?', [req.params.num], function(err, result){
            res.send(ejs.render(data, {
                data : result[0],
                name : userName
            })); 
        });
    });
});
app.post('/update/:num', function(req, res){
    var body = req.body;
    client.query('update memo set title=?, date=?, content=? where post_num=?',
    [body.title, body.date, body.content, req.params.num], function(){
        res.redirect("/detail/"+[req.params.num]);
    });
});