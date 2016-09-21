var app = require('express')();
var server = require('http').createServer(app);
var mongodb = require('mongodb');
var url = require('url');
var https = require('https');
var MongoClient = mongodb.MongoClient;
var dbUrl = process.env.MONGO_URI;
var apiKey = process.env.API_KEY;
var searchEngineId = process.env.SEARCH_ENGINE_ID;
var collection;

app.get('/api/imagesearch/:imageQuery', function(req, res) {
    var reqUrl = req.url;
    // we want the offset query in an object
    var reqUrlObj = url.parse(reqUrl, true);
    var num = reqUrlObj.query && reqUrlObj.query.offset || 10;
    if (num > 10) {
        num = 10;
    }
    var apiUrl = getAPICall(req.params.imageQuery, num);
    https.get(apiUrl, function (apiRes) {
      console.log('statusCode:', apiRes.statusCode);
      console.log('headers:', apiRes.headers);
      var body = '';
      apiRes.setEncoding('utf8');
      apiRes.on('data', function(chunk) {
        body += chunk;
      });
      apiRes.on('end', function() {
        res.send(JSON.parse(body));
      });
    }).on('error', function (e) {
      console.error(e);
    });
});

function getAPICall(query, num) {
    return url.format({
        protocol: 'https',
        host: 'www.googleapis.com',
        pathname: '/customsearch/v1',
        query: {
            cx: searchEngineId,
            key: apiKey,
            num: num,
            q: query,
            searchType: 'image'
        }
    });
}


// MongoClient.connect(dbUrl, function (err, db) {
//   if (err) {
//     console.log('Unable to connect to the mongoDB server. Error:', err);
//     return;
//   } else {
//     console.log('Connection established to', dbUrl);
//     collection = db.collection('searchHistory');
//     initServer();
//   }
// });

// function pushToDataBase(id, val) {
//     return collection.insert({
//         _id: id,
//         dbUrl: val
//     });;
// }

function initServer() {
    server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function(){
      var addr = server.address();
      console.log('server listening at', addr.address + ':' + addr.port);
    });
}

initServer();
