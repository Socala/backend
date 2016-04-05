var dbContext = require('./dbs/dbContext');

function startServer() {
    
    var app = require('./app');
    var port = process.env.PORT || 8080;

    app.listen(port);
    console.log('Magic happens on port ' + port);
}

dbContext.start().then(startServer);
