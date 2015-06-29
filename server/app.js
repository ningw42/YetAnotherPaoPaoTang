var express = require('express') ,
	app = express() ,
	http = require('http') ,
	server = http.createServer(app),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	mysql = require('./Database'),
	monitor = null,
	path = require('path'),
	io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/../web')) ;
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

mysql.connect();

app.post('/userLogin', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	mysql.query('SELECT * FROM user_info WHERE username = \'' + username + '\'', function(err, rows, fields) {
		//console.log();
		if (err) {
			//throw err;
		} else {
			if (rows.length > 0) {
				if (rows[0].password == password) {
					res.cookie('username', username, { expires: new Date(Date.now() + 900000), httpOnly: true });
					res.cookie('isLogin', true, { expires: new Date(Date.now() + 900000), httpOnly: true });
					res.send('SUCCESS');
					//res.redirect('game.html');
				} else {
					res.send('WRONG_PASSWORD');
				}
			} else {
				res.send('NO_USER');
			}
		}
	});
});

app.post('/userRegister', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	mysql.query('INSERT INTO user_info VALUES(\'' + username + '\', \'' + password + '\')', function(err, rows, fields) {
		if (err) {
			if (err.code == 'ER_DUP_ENTRY') {
				res.send('DUP_USERNAME');
			}
			//throw err;
		} else if (rows) {
			//console.log(rows);
			res.send('SUCCESS');
		}
	});
});

app.get('/game', function (req, res) {
	if (req.cookie) {
		res.sendfile(path.resolve(__dirname + '/../web/game.html'));
	} else {
		res.redirect('/');
	}
});

monitor = require('./monitor.js').start(io) ;

server.listen(8080 , function() {
	console.log('Listening on %s:%d' , server.address().address , server.address().port) ;
}) ;