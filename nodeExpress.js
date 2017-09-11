var express = require('express');

var app = express();

app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// More Imports here

app.set('port', process.env.PORT || 3000);

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
});
// Route to the contact page
app.get('/contact', function(req, res){
    res.render('contact');
});
// Route to a file upload
app.get('/file-upload', function(req, res){
    res.render('file-upload');
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
