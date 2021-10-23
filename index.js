const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const multer = require('multer');
const express = require('express');
const app = express();
app.set('view engine', 'pug')
const port = 3001;

main();

async function main() {
    var uri = "mongodb+srv://admin:1010725430@cluster0.tlbjf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"; //database link
    var mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoClient.connect(); //connect to database, wait for it
    console.log("Connected correctly to server");
    var db = mongoClient.db('hackgt');
    var collection = db.collection('posts');
    loadPosts(collection);
    var upload = multer(); //parsing use
    app.use(express.json());//parsing use
    app.use(express.urlencoded({ //parsing use
      extended: true
    }));
    app.use(upload.array());  //parsing use
    app.use(express.static('public')); //parsing use
    app.post('/', function(req, res){ //this is called when we hit the submit button
        console.log(req.body); //log the information, just for debug purposes
        Add(collection, req.body); //create a new entry in the database
        collection.find({}).toArray(function (err, result) { //let's update the webpage now that we've made a new entry
            if (err) {
                res.send(err);
            } else {
                var entries = [];
                for (var x = 0; x < result.length; x++) {
                    entries[x] = JSON.stringify(result[x]) + "aaaa";
                }
                res.render('test.pug', { //send the new webpage to the user
                    lines: entries
                });
            }
        })
    });
    
    app.listen(port, () => { //just for hosting the website
        console.log(`Listening at http://localhost:${port}`);
    })
}

async function Add(collection, data) { //this is a one line, since we need to be able to use async
    await collection.insertOne(data);
}

async function loadPosts(collection) { //this is to load the initial webpage with the previous entries
    collection.find({}).toArray(function (err, result) {
        if (err) {
            res.send(err);
        } else {
            app.get('/', (req, res) => {
                res.render('test.pug', {
                    lines: JSON.stringify(result)
                });
            })
        }
    })
}