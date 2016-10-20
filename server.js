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
var history = [];

app.get('/api/imagesearch/:imageQuery', function(req, res) {
    var reqUrl = req.url;
    // we want the offset query in an object
    var reqUrlObj = url.parse(reqUrl, true);
    var offset = reqUrlObj.query && reqUrlObj.query.offset || 1;
    var imageQuery = req.params.imageQuery;
    history.unshift({
      term: imageQuery,
      when: new Date().toISOString()
    });
    var apiUrl = getAPICall(imageQuery, offset);
    https.get(apiUrl, function (apiRes) {
      var body = '';
      apiRes.setEncoding('utf8');
      apiRes.on('data', function(chunk) {
        body += chunk;
      });
      apiRes.on('end', function() {
        res.send(JSON.parse(body).items.map(function pickFields(item) {
          return {
            url: item.link,
            alt: item.title,
            sourcePage: item.image.contextLink
          };
        }));
      });
    }).on('error', function (e) {
      console.error(e);
    });
});

app.get('/api/latest/imagesearch', function(req, res) {
    res.send(history);
});

function getAPICall(query, offset) {
    return url.format({
        protocol: 'https',
        host: 'www.googleapis.com',
        pathname: '/customsearch/v1',
        query: {
            cx: searchEngineId,
            key: apiKey,
            start: offset,
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
