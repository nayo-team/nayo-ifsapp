// --- Libraries & Global ----
var express = require('express'); // app use express for routing
var session = require('express-session'); // manage session
var oracledb = require('oracledb'); // node-oracledb
var bodyParser = require('body-parser'); // pull infommation from HTML GET and POST 
//var cookieParser = require('cookie-parser'); // implement cookies
var morgan = require('morgan'); //logging purpose

var app = express();
var connString = "192.169.255.134:1521/RACE81";

var sess; //hold session
// ------------------
// ---- APP Config ----

//--- allow CORS ---
/*var allowCrossDomain = function(req, res, next) {
    if ('OPTIONS' == req.method) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
      res.send(200);
    }
    else {
      next();
    }
}; 
app.use(allowCrossDomain); 
*/

//allow cross domain
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(morgan('dev')); //dev log
//app.use(cookieParser());
app.use(express.static(__dirname + '/public')); //set static file location (/public/img for public, /img for user)
app.use(bodyParser.urlencoded({'extended':'false'})); //parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.use(session({
  secret: 'N@y0SessionP4s5W0Rd',
  resave : true,
  saveUninitialized : true,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 2160000000
  }
}));

//----------- ROUTES -----------
//This respond for root
app.get('/', function (req, res) {
     sess=req.session; //get session

    //TODO: this respond is for webapps, if request is for mobileapps send routes notification instead
    if(sess.username){
        res.redirect('/home'); //redirect to /home
    } else {
        
        //res.sendFile(__dirname +'/public/index.html'); // load single view html page (angular will handle front end page)
        res.sendFile(__dirname +'/web/index.html'); // load single view html page (angular will handle front end page)
    }
});

app.get('/login', function (req, res) {
     sess=req.session; //get session

    if(sess.username){
        if(sess.mode == 'mobile'){ //mobile apps
            res.set('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify({
                status: 200,
                message: 'Logged in.',
                detailed_message: 'Username '+ sess.username+ ' is logged in.',
                data: sess.username,
                route: './home/home.html'
            }));
        } else{ //web apps
            res.redicrect('/home'); //redirect to /home
        }
        
    } else {
        
        //res.sendFile(__dirname + '/public/src/login/login.html'); // load single view html page (angular will handle front end page)
        res.sendFile(__dirname + '/web/index.html'); // load single view html page (angular will handle front end page)
    }
});


app.get('/home', function(req, res){
    // check session
    sess = req.session;
    console.log('---home request---');
    console.log(sess);
        
    //check session
    if(sess.username){
        if(sess.mode == 'mobile'){ //mobile apps
            res.set('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify({
                status: 200,
                message: 'Authentication Ok.',
                detailed_message: 'Login process is successful / session still alive.',
                data: 'ok',
                route: './home/home.html'
            }));
        } else{ //web apps
           //res.sendFile(__dirname+'/public/src/home/home.html');
            res.sendFile(__dirname+'/web/page/home.html');
        }
    }else{
        res.redirect('/');
    }
});


app.get('/api/logout', function(req, res){
    //logout
    sess = req.session;
    
    if(sess.mode == 'mobile'){ // mobile version
        req.session.destroy(function(err) {
          if(err) {
            console.log(err);
          } else {
            res.set('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify({
                status: 200,
                message: 'Logout Ok.',
                detailed_message: 'Logout process is successful.',
                data: 'ok',
                route: './login/login.html'
            }));
          }
        });
        
    } else { //web version
        req.session.destroy(function(err) {
          if(err) {
            console.log(err);
          } else {
            res.redirect('/');
          }
        });
    }
});

app.get('/api/login/status', function(req, res){
    // check session
    sess = req.session;
    console.log('---status request---');
    console.log(sess);
        
    //check session
    if(sess.username){
        res.set('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({
            status: 200,
            message: 'Logged in.',
            detailed_message: 'Username '+ sess.username+ ' is logged in.',
            data: sess.username,
            route: ''
        }));
    }else{
        res.set('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({
            status: 200,
            message: 'Not logged in.',
            detailed_message: 'Not logged in or session has expired.',
            data: '',
            route: ''
        }));
    }
});


// ---- DB Related Handler Functions  ----
//----  This is respond for IFS login (atm get 1 from dual)
//app.get('/api/login',  function(req, res){
app.get('/api/login/:USERNAME/:PASSWORD/:MODE',  function(req, res){
	//get params
	//console.log("[Trigger]: '/api/login' accessed ");
	//console.log('--username: ' + req.params.USERNAME);
	//console.log('--password: ' + req.params.PASSWORD);
    //console.log('--mode: ' + req.params.MODE); //mobile/web

    
	//connect to dbserver
	oracledb.getConnection({
        user          : req.params.USERNAME, //ifsapp
        password      : req.params.PASSWORD, //ifsapp
        connectString : connString},
	  function(err, connection){
        if (err) { //error connecting to DB
            console.error(err.message); 
            res.set('Content-Type', 'application/json');
            res.status(500).send(JSON.stringify({
                status: 500,
                message: "Error connecting to DB",
                detailed_message: err.message,
                data: '',
                route: './login/login.html'
            }));
            return;
        }
	 
        connection.execute( "SELECT 1 result from dual", {}, {outFormat:oracledb.OBJECT},  
          function(err, result){
            if (err) { 
                console.error(err.message); 
                res.set('Content-Type', 'application/json');
                res.status(500).send(JSON.stringify({
                    status: 500,
                    message: 'Error getting sysdate from DB.',
                    detailed_message: err.message,
                    data: '',
                    route: './page/login.html'
                }));
            } else{

                //log
                console.log("--executeSQL:"+ "SELECT 1 from dual ---> Login is successful / credentials is valid.");
                //console.log("-----metadata:"+ result.metaData);
                //console.log("-----rows:"+ result.rows);
                	
                //manage session
                sess = req.session;
                sess.username = req.params.USERNAME;
                sess.password = req.params.PASSWORD;
                sess.mode = req.params.MODE;
                console.log('---login process--');
                console.log(sess);

                
                //---- return response
                //-return json result
                res.contentType('application/json').status(200);
                res.end(JSON.stringify({
                    status: 200,
                    message: 'Authentication OK.',
                    detailed_message: 'Login process is successful.',
                    data: result,
                    route: './home/home.html'
                }));

                //return page instead
                //res.sendFile(__dirname + '/public/page/main.html');
                
                //release connection
                connection.release(function(err) {  
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log('--GET /api/login : connection released.');
                    }  
                 });  
            }
          });
	  });
	
	 function doRelease(connection) {  
         connection.release(  
              function(err) {  
                   if (err) {console.error(err.message);}  
              }  
         );  
     }  
    
});

app.post('/api/login',  function(req, res){
	//get params
	//console.log("[Trigger]: '/api/login' accessed ");
	console.log('--username: ' + req.body.username);
	console.log('--password: ' + req.body.password);
    console.log('--mode: ' + req.body.mode); //mobile/web
    console.log(req.body);
    
	//connect to dbserver
	oracledb.getConnection({
        user          : req.body.username, //ifsapp
        password      : req.body.password, //ifsapp
        connectString : connString},
	  function(err, connection){
        if (err) { //error connecting to DB
            console.error(err.message); 
            res.set('Content-Type', 'application/json');
            res.status(500).send(JSON.stringify({
                status: 500,
                message: "Error connecting to DB",
                detailed_message: err.message,
                data: '',
                route: './login/login.html'
            }));
            return;
        }
	 
        connection.execute( "SELECT 1 result from dual", {}, {outFormat:oracledb.OBJECT},  
          function(err, result){
            if (err) { 
                console.error(err.message); 
                res.set('Content-Type', 'application/json');
                res.status(500).send(JSON.stringify({
                    status: 500,
                    message: 'Error getting sysdate from DB.',
                    detailed_message: err.message,
                    data: '',
                    route: './page/login.html'
                }));
            } else{

                //log
                console.log("--executeSQL:"+ "SELECT 1 from dual ---> Login is successful / credentials is valid.");
                //console.log("-----metadata:"+ result.metaData);
                //console.log("-----rows:"+ result.rows);
                	
                //manage session
                sess = req.session;
                sess.username = req.body.username;
                sess.password = req.body.password;
                sess.mode = req.body.MODE;
                console.log('---login process--');
                console.log(sess);

                
                //---- return response
                //-return json result
                res.contentType('application/json').status(200);
                res.end(JSON.stringify({
                    status: 200,
                    message: 'Authentication OK.',
                    detailed_message: 'Login process is successful.',
                    data: result,
                    route: './home/home.html'
                }));

                //return page instead
                //res.sendFile(__dirname + '/public/page/main.html');
                
                //release connection
                connection.release(function(err) {  
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log('--GET /api/login : connection released.');
                    }  
                 });  
            }
          });
	  });
	
	 function doRelease(connection) {  
         connection.release(  
              function(err) {  
                   if (err) {console.error(err.message);}  
              }  
         );  
     }  
    
});

// ----- End IFS LOGIN -----



// ---- SERVER Functions ---- 
//start the server and listen at designated port
var server = app.listen(38080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Nodeapp listening at http://%s:%s", host, port)
});
//-----------------------------