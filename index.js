const express = require('express');
const app = express();
app.set('view engine', 'pug')
const port = 3001;

app.get('/', (req, res) => {
    res.render('test.pug', {
    });
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
})
