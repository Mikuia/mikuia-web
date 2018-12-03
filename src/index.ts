import * as express from 'express';

const isProduction = process.env.NODE_ENV == 'production';

var app = express();

app.use(express.static(__dirname + '/../web/public'));

app.get('/dist/bundle.js', (req, res) => {
    if(isProduction) {
        res.sendFile(__dirname + '/../web/public/dist/bundle.js');
    } else {
        res.redirect('http://localhost:16835/dist/bundle.js');
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.listen(16834);