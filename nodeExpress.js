var express = require('express');

var app = express();

app.disable('x-powered-by');

app.set('port', process.env.PORT || 3000);

app.get('/', function (req, res){
    res.send('<h1>Express is Working!</h1>');
});

app.listen(app.get('port'), function(){
    console.log('Press CTRL-C to quit');
});