// Start a new Express app
var express = require('express');
var app = express();
// Remove server header for security
app.disable('x-powered-by');
// Use Handlebars engine with main on every render
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// More Imports here
app.use(require('body-parser').urlencoded({extended:true}));
var formidable = require('formidable');
// Some salt
var credentials = require('./credentials');
app.use(require('cookie-parser')(credentials.cookieSecret));
// Let the port for the app
app.set('port', process.env.PORT || 3000);
// Load folders as static location
app.use(express.static(__dirname + '/public'));
/* Test get and app
app.get('/', function (req, res){
    res.send('<h1>Express is Working!</h1>');
});
*/

// The default path.  ET phone home
app.get('/', function(req, res){
    res.render('home');
    console.log('Home: Default URL');
});
// Route to about page
app.get('/about', function(req, res){
    res.render('about');
    console.log(req.route);
});


// Route to the contact page
app.get('/contact', function(req, res){
    res.render('contact', { csrf: 'CSRF Token Here' });
});

app.post('/process', function (req, res) {
   console.log('Form Data: ' + req.query.form);
   console.log('CSRF Token: ' + req.body._csrf );
   console.log('Name: ' + req.body.contactName);
   console.log('Email: ' + req.body.emailAddy);
   console.log('Request Info: ' + req.body.description);
   res.redirect(303, '/thankyou');
});
app.get('/thankyou', function (req, res){
   res.render('thankyou');
});
// Route to a file upload
app.get('/file-upload', function(req, res){
    var now = new Date();
    console.log(now.getDate());
    res.render('file-upload',{
        year: now.getFullYear(),
        month: now.getMonth()
    });
});

app.post('/file-upload/:year/:month',
    function (req, res){
       var form = new formidable.IncomingForm;
       form.parse(req, function(err, fields, file){
            if(err)
            {return res.redirect(303, 'file-error');}
            console.log('Received File');
            console.log(req.url);
            console.log(file);
            res.redirect(303,'/thankyou')
       });
});



// Set the cookie with expiration date
app.get('/cookie', function (req, res) {
    res.cookie('userName', 'Shoeberto', {expire: new Date() + 9999}).send('User Name is Shoeberto');
});
// Print all cookies to the console
app.get('/listcookies',  function (req, res){
    console.log('Cookies: ',  req.cookies);
    res.send('Check the console for cookies');
});
// Clear all cookies
app.get('/deletecookies', function (req, res){
    res.clearCookie('userName');
    res.send('userName Cookie Deleted');
});

// Session variables
var session = require('express-session');
var parseurl = require('parseurl');

app.use(session({
    resave: false, //This will only save changes
    saveUninitialized: true,
    secret: credentials.cookieSecret,
}));

app.use(function(req, res, next){
    var views = req.session.views;

    if(!views){
        views = req.session.views = {};
    }

    var pathname = parseurl(req).pathname;

    views[pathname] = (views[pathname] || 0) + 1;

    next();
});

app.get('/viewcount', function (req, res, next) {
   res.send('You viewed this age ' + req.session.views['/viewcount'] + 'times');
});

// FileSystem module
var fs = require('fs');
app.get('/readfile', function(req, res, next){
    fs.readFile('./public/randomFile.txt', function(err, data){
        if(err){
            return console.error(err);
        }
        res.send('File Data: ' + data.toString());


    });
});

app.get('/writefile', function(req,res,next){
    fs.writeFile('./public/randomOut.txt', 'Some Random File Output', function(err){
        if(err){
            return console.error(err);
        }
    });
    fs.readFile('./public/randomOut.txt', function (data, err) {
        if(err){
            return console.error(err);
        }
        res.send('File Data: ' + data.toString());
    });
});

// Error catch
app.get('/error', function (req, res, next) {
    console.log('Tried to get a page that doesn\'t exist');
    throw new Error('This page does not exist!');
});

// Middleware
app.use(function(req, res, next){
    console.log("Looking for URL: " + req.url);
    next();
});

// Throws error into the backend not the browser
app.use(function (err, req, res, next) {
    console.log('Error: ' + err.message);
    console.log(req.url);
    next();
});
// 404 Handler
app.use(function(req, res){
    res.type('text/html');
    res.status(404);
    res.render('404');
});
// 500 Handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

// A listener with console link to the site
app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + ' Press CTRL-C to exit');
});
