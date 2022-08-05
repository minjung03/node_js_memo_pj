// 모듈 추출
var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var express = require('express');
var static = require('serve-static');
var expressSession = require('express-session'); 
var path = require("path");
var bodyParser = require('body-parser');
var expressErrorHandler = require('express-error-handler');
var errorHandler = require('errorhandler');
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
    password: '1234',
    database: 'nodejs'
});

// 서버 실행
app.listen(app.get('port'), function(){
    console.log('server running at http//127.0.0.1:4444...')
});

app.use(express.static(`${__dirname}/static`)); // static 있는 것을 정적 경로로
app.use('/style', express.static(__dirname+'/style'));

// 사용자 id 저장 변수
var userId;
var userName;

// 세션 사용
app.use(expressSession({
    secret : 'meLLong',
    resave :true,
    saveUninitialized:true
}));


// ----------------------시작(로그인) 화면----------------------
app.get('/', function(req, res){ 
    if(req.session.user){
        console.log('세션 존재함');
        res.redirect('/list');
    }else{
        fs.readFile('index.html', 'utf8', function(error, data){
        res.send(data);
        });
    }
});

// ----------------------회원 가입----------------------
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

// ----------------------로그인----------------------
app.post('/login', function(req, res){ 
    var parmId = req.body.id; 
    var parmPass = req.body.pass;
    console.log('요청 파라미터 : '+parmId+', '+parmPass);
    
    client.query('select * from user', function(err, results){
        for (var i = 0; i <= results.length; i++) {
            if(i == results.length){
                res.send(`<link href="style/modal.css" rel="stylesheet" /><script src="/js/modal.js" defer></script><div class="modal">
                <div class="modal_body">
                    <p>아이디 혹은 비밀번호를 잘못입력하셨습니다.</p>
                    <div class="modal_ok">확인</div>
                </div>
              </div>`);
                return;
            }            
            else if(results[i].id == parmId && results[i].pass == parmPass) {
                client.query('select * from user where id = ?;', parmId, function(err, result){
                    //세션 저장
                    req.session.user = {
                        id : parmId,
                        name : result[0].name
                    }
                    userId = req.session.user.id; // 변수에 세션 값 저장
                    userName = req.session.user.name;
                    res.redirect('/list');
                });
                return;
            }
        }
    });    
});

// ----------------------로그 아웃----------------------
app.get('/logout', function(req, res){ 
    req.session.destroy(function(error){ // 세션 삭제
        if(error) throw error;
        console.log('세션 삭제됨');
        res.redirect('/');
    })
});

// ----------------------메모 목록----------------------
app.get('/list', function(req, res){
    fs.readFile('html/list.html', 'utf8', function(error, data){
        
        if(!req.session.user){
            res.redirect('/html/modal.html');
            // res.redirect('/list');
        }
        else {
            client.query('select * from memo where id = ?', userId, function(err, result){
                res.send(ejs.render(data, {
                    data : result,
                    name : userName
                })); 
            });
        }
    });
});

// ----------------------메모 상세----------------------
app.get('/detail/:num', function(req, res){ 
    
    if(!req.session.user){
        res.redirect('/html/modal.html');
    }
    else {
        fs.readFile('html/detail.html', 'utf8', function(error, data){
            client.query('select * from memo where post_num = ?', [req.params.num] , function(err, result){
                res.send(ejs.render(data, {
                    data : result,
                    name : userName
                })); 
            });
        });
    }
});


// ----------------------메모 저장----------------------
app.get('/add', function(req, res){ 
    if(!req.session.user){
        res.redirect('/html/modal.html');
    }
    else {
        fs.readFile('html/add.html', 'utf8', function(error, data){
            res.send(ejs.render(data, {
                name : userName
            })); 
        });
    }
});
app.post('/add', function(req, res){ 
    var body = req.body;
    client.query('insert into memo(title, date, content, id) values (?,?,?,?)',
    [body.title, body.date, body.content, userId], function(){
        res.redirect('/list');
    });
});

// ----------------------메모 삭제----------------------
app.get('/delete/:num', function(req, res){
    console.log('delete');
    client.query('delete from memo where post_num=?', [req.params.num], function(){
        res.redirect("/list");
    });
});

// ----------------------메모 수정----------------------
app.get('/update/:num', function(req, res){
    
    if(!req.session.user){
        res.redirect('/html/modal.html');
    }
    else {
        fs.readFile('html/update.html', 'utf8', function(error, data){
            client.query('select * from memo where post_num = ?', [req.params.num], function(err, result){
                res.send(ejs.render(data, {
                    data : result[0],
                    name : userName
                })); 
            });
        });
    }
});
app.post('/update/:num', function(req, res){
    var body = req.body;
    client.query('update memo set title=?, date=?, content=? where post_num=?',
    [body.title, body.date, body.content, req.params.num], function(){
        res.redirect("/detail/"+[req.params.num]);
    });
});

// 404 에러 핸들러
var errorHandler = expressErrorHandler({
    static : {
        '404' : './html/404error.html'
    }
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);