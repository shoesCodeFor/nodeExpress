// Start a new Express app
var express = require('express');
var app = express();
// Remove server header for security
app.disable('x-powered-by');
// Use Handlebars engine without
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// More Imports here
app.use(require('body-parser').urlencoded({extended:true}));

var formidable = require('formidable');

var credentials = require('./credentials');
app.use(require('cookie-parser')(credentials.cookieSecret));
// Let the port for the app
app.set('port', process.env.PORT || 3000);
// Load folders as static location
app.use(express.static(__dirname + '/public'));
/*
app.get('/', function (req, res){
    res.send('<h1>Express is Working!</h1>');
});


*/
// The default path.  ET phone home
app.get('/', function(req, res){
    res.render('home');
});
// Route to about page
app.get('/about', function(req, res){
    res.render('about');
    console.log(req);
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
})

// A listener with console link to the site
app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + ' Press CTRL-C to exit');
});
