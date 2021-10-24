const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const multer = require('multer');
const express = require('express');
const path = require('path'); 
const app = express();
app.set('view engine', 'pug')
const port = 3001;

main();

async function main() {
    var uri = "mongodb+srv://admin:1010725430@cluster0.tlbjf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"; //database link
    var mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoClient.connect(); //connect to database, wait for it
    console.log("Connected to server.");
    var db = mongoClient.db('hackgt');
    var collection = db.collection('posts');

    app.get('/', (req, res) => {
        res.render('index.pug', {});
    })

    var upload = multer(); //parsing use
    app.use(express.json()); //parsing use
    app.use(express.urlencoded({ //parsing use
      extended: true
    }));
    app.use(upload.array());  //parsing use
    app.use(express.static(path.join(__dirname, '/public'))); //parsing use
    app.post('/', function(req, res){ //this is called when we hit the submit button
        Add(collection, req.body); //create a new entry in the database
        collection.find({}).toArray(function (err, result) { //let's update the webpage now that we've made a new entry
            if (err) {
                res.send(err);
            } else {
                var entries = [];
                for (var x = 0; x < result.length; x++) {
                    entries[x] = JSON.stringify(result[x]);
                }
                res.render('index.pug');
            }
        })
    });

    app.get('/index', function (req, res) {
        res.render('index.pug');
    })
    
    app.get('/resources', function (req, res) {
        res.render('resources.pug');
    })

    app.get('/search', function (req, res) {
        var searchText = req.query.searchText.toLowerCase();
        collection.find({}).toArray(function (err, result) {
            if (err) {
                res.send(err);
            } else {
                var index = 0;
                var store = [];
                for (var x = 0; x < result.length; x++) {
                    if (result[x].ident.toLowerCase().includes(searchText) || result[x].rant.toLowerCase().includes(searchText)) {
                        store[index] = result[x];
                        if (store[index].isAnonymous) {
                            store[index].fname = "Anonymous User";
                        }
                        index++;
                    }
                }
                res.render('about.pug', {
                    lines: store
                });
            }
        })
    })

    app.get('/about', function (req, res) {
        collection.find({}).toArray(function (err, result) {
            if (err) {
                res.send(err);
            } else {
                var store = [];
                for (var x = 0; x < result.length; x++) {
                    store[x] = result[x];
                    if (store[x].isAnonymous) {
                        store[x].fname = "Anonymous User";
                    }
                }
                res.render('about.pug', {
                    lines: store
                });
            }
        })
    })

    app.listen(port, () => { //just for hosting the website
        console.log(`Listening at http://localhost:${port}`);
    })
}

async function Add(collection, data) { //this is a one line, since we need to be able to use async
    await collection.insertOne(data);
}