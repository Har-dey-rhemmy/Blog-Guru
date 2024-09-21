const express = require('express');
const mongoose = require('mongoose');
const blogRoutes = require('./routes/blog-routes')
    //const authRoutes = require('./routes/auth');
    // express app
const app = express();

// connect to mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const dbURI = 'mongodb+srv://Aderemi123:test1234@Cluster0.vbcmw.mongodb.net/Remi-tuts?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));



app.use(express.json());
// register view engine
app.set('view engine', 'ejs');

// listen for request
//app.listen(3000);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
// routes
app.get('/', (req, res) => {
    res.redirect('/blogs');
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

// blog routes
//app.use('/auth', authRoutes);
app.use(blogRoutes);
// 404 page
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});