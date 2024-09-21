const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Blog = require('../models/blog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/users');


const JWT_SECRET = 'Aderemi'

//Register a new user
router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // create a new user
        user = new User({
            username,
            email,
            password
        });

        //Hash password before saving it to the database
        const crypt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, crypt);

        await user.save();

        // Create and return JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30h' });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Issue')
    }
});

// User login
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Find user by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Compare the entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token if authentication is successful
        const payload = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30h' });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Issue');
    }
});


router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});


router.get('/blogs', (req, res) => {
    Blog.find().sort()
        .then((result) => {
            res.render('index', { title: 'All Blogs', blogs: result })
        })
        .catch((err) => {
            console.log(err);
        });
});

router.post('/blogs/create', (req, res) => {
    const blog = new Blog(req.body);

    blog.save()
        .then((result) => {
            res.redirect('/blogs')
        })
        .catch((err) => {
            console.log(err);
        })
});

router.get('/blogs/create', (req, res) => {
    res.render('create', { title: 'Create a new blog' });
});

router.get('/blogs/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    Blog.findById(id)
        .then((result => {
            res.render('details', { blog: result, title: 'Blog Details' });
        }))
        .catch(err => {
            res.status(404).render('404', { title: 'Blog not found :) ' });
        });
})

router.delete('/blogs/:id', auth, (req, res) => {
    const id = req.params.id;

    Blog.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/blogs' });
        })
        .catch(err => {
            console.log(err);
        })
})

router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

// redirects
router.get('/about-us', (req, res) => {
    res.redirect('/about');
});


module.exports = router;