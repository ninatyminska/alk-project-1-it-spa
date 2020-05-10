require('dotenv').config();
const express = require('express');
const { buildCheckFunction, validationResult } = require('express-validator');
const checkBody = buildCheckFunction(['body']);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local');
const Room = require('./models/room');
const Treatment = require('./models/treatment');
const User = require('./models/user');
const Basket = require('./models/basket');
const Order = require('./models/order');

const mdbUser = process.env.MDB_USER;
const mdbPssw = process.env.MDB_PSSW;
mongoose.connect(
    'mongodb+srv://' +
        mdbUser +
        ':' +
        mdbPssw +
        '@cluster0-fzafn.mongodb.net/alk-it-spa?retryWrites=true&w=majority',
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);
mongoose.set('useFindAndModify', false);

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
    require('express-session')({
        secret: 'Secret',
        resave: false,
        saveUninitialized: false,
        maxAge: 3600 * 1000,
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(
    new localStrategy(
        {
            usernameField: 'mail',
            passwordField: 'pass',
        },
        User.authenticate()
    )
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static('static'));
app.use('/sources', express.static(`${__dirname}/node_modules/`));

app.get('/database/rooms', async (req, res) => {
    try {
        const allRooms = await Room.find({}).exec();
        res.setHeader('Content-Type', 'application/json');
        res.send(allRooms);
    } catch (err) {
        res.send('error');
    }
});

app.get('/database/treatments', async (req, res) => {
    try {
        const allTreatments = await Treatment.find({}).exec();
        res.setHeader('Content-Type', 'application/json');
        res.send(allTreatments);
    } catch (err) {
        res.send('error');
    }
});

app.get('/database/rooms/:id/:arr/:dep', async (req, res) => {
    try {
        const roomId = req.params.id;
        const dateArr = req.params.arr;
        const dateDep = req.params.dep;

        const basket = new Basket(req.session.basket ? req.session.basket : {});

        await Room.findById(roomId).exec((err, room) => {
            res.setHeader('Content-Type', 'application/json');
            if (err) {
                res.send('error');
            } else {
                if (room.id in basket.items) {
                    res.send('exists');
                } else {
                    basket.addItem(room, room.id, dateArr, dateDep);
                    req.session.basket = basket;
                    res.send('added');
                }
            }
        });
    } catch (err) {
        res.send('error');
    }
});

app.get('/database/treatments/:id', async (req, res) => {
    try {
        const treatmentId = req.params.id;
        const basket = new Basket(req.session.basket ? req.session.basket : {});

        await Treatment.findById(treatmentId).exec((err, treatment) => {
            res.setHeader('Content-Type', 'application/json');
            if (err) {
                res.send('error');
            } else {
                if (treatment.id in basket.items) {
                    if (basket.items[treatmentId].qty > 2) {
                        res.send('max');
                    } else {
                        basket.addItem(treatment, treatment.id);
                        req.session.basket = basket;
                        res.send('added');
                    }
                } else {
                    basket.addItem(treatment, treatment.id);
                    req.session.basket = basket;
                    res.send('added');
                }
            }
        });
    } catch (err) {
        res.send('error');
    }
});

app.get('/database/basket', async (req, res) => {
    try {
        const basket = req.session.basket;
        res.setHeader('Content-Type', 'application/json');
        res.send(basket);
    } catch (err) {
        res.send('error');
    }
});

app.get('/database/basket/remove/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const basket = new Basket(req.session.basket ? req.session.basket : {});
        res.setHeader('Content-Type', 'application/json');

        basket.removeOne(itemId);
        req.session.basket = basket;
        res.send(basket);
    } catch (err) {
        res.send('error');
    }
});

app.get('/database/basket/delete/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const basket = new Basket(req.session.basket ? req.session.basket : {});
        res.setHeader('Content-Type', 'application/json');

        basket.removeItem(itemId);
        req.session.basket = basket;
        res.send(basket);
    } catch (err) {
        res.send('error');
    }
});

app.get('/database/checkout', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        if (!req.session.basket || req.session.basket.totalQty === 0) {
            res.send('empty');
        } else if (!req.isAuthenticated()) {
            res.send('not logged');
        } else {
            const basket = new Basket(req.session.basket);
            const user = await User.findById(req.user._id).exec();

            const order = new Order({
                user: req.user,
                order: basket,
            });

            order.save();
            user.orders.push(order);
            user.save();
            req.session.basket = null;

            res.send('success');
        }
    } catch (err) {
        res.send('error');
    }
});

app.get('/database/order/delete/:id', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        Order.findById(req.params.id, (err, order) => {
            if (err) {
                res.send('error');
            } else {
                User.findByIdAndUpdate(
                    req.user._id,
                    { $pull: { orders: req.params.id } },
                    { new: true }
                )
                    .populate('orders')
                    .exec((err, user) => {
                        if (err) {
                            res.send('error');
                        } else {
                            user.save();

                            if (user.orders.length === 0) {
                                order.remove();
                                res.send('no orders');
                            } else {
                                order.remove();
                                res.send('success');
                            }
                        }
                    });
            }
        });
    } catch (err) {
        res.send('error');
    }
});

app.post(
    '/api/user/register',
    [
        checkBody('mail', 'Podaj prawidłowy adres e-mail.')
            .isEmail()
            .normalizeEmail(),
        checkBody('pass')
            .isLength({ min: 5 })
            .withMessage('Hasło musi zawierać min. 5 znaków.')
            .matches(
                /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{5,}$/
            )
            .withMessage(
                'Hasło musi zawierać min.: 1 cyfrę, 1 małą literę, 1 dużą literę, 1 znak specjalny.'
            ),
    ],
    async (req, res) => {
        try {
            const { mail, pass } = req.body;

            const formErrors = validationResult(req);
            if (!formErrors.isEmpty()) {
                res.send(formErrors);
            } else {
                let newUser = new User({
                    username: mail,
                });
                User.register(newUser, pass, (err) => {
                    res.setHeader('Content-Type', 'application/json');

                    if (err) {
                        res.send('error');
                    } else {
                        res.send('success');
                    }
                });
            }
        } catch (err) {
            res.send('error');
        }
    }
);

app.post('/api/user/login', async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        res.setHeader('Content-Type', 'application/json');

        if (info != undefined) {
            res.send(info);
        }

        if (user) {
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }

                res.send('success');
            });
        }

        if (err) {
            res.send('error');
        }
    })(req, res, next);
});

app.get('/api/user/logout', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');

        req.logout();
        res.send('logout');
    } catch (err) {
        res.send('error');
    }
});

app.get('/api/user', async (req, res) => {
    try {
        const isUserAuthenticated = req.isAuthenticated();

        res.setHeader('Content-Type', 'application/json');
        res.send(isUserAuthenticated);
    } catch (err) {
        res.send('error');
    }
});

app.get('/api/user/account', async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            let user = await User.findById(req.user.id)
                .populate('orders')
                .exec();
            let allOrders = user.orders;

            res.setHeader('Content-Type', 'application/json');
            res.send(allOrders);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send('not logged');
        }
    } catch (err) {
        res.send('error');
    }
});

app.use((req, res) => {
    res.sendFile(`${__dirname}/static/index.html`);
});

app.listen(port, () => {
    console.log('listening on %d', port);
});
