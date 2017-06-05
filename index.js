var express = require('express')
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs')
var suid = require('rand-token').suid;
var morgan = require('morgan')
var moment = require('moment')
var path = require('path')
var dateutil = require('dateutil');
var methods = require('./methods');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var rfs = require('rotating-file-stream')
var router = express.Router();
var func = require('./ifunctions');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FCM = require('fcm-push');
var mailer = require("nodemailer");
var multer = require('multer')
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
var serverKey = 'AIzaSyDdSCwfD85uuuBNc3yIGsMCxrJI3G72sgQ';
var fcm = new FCM(serverKey);
var app = express();
var logDirectory = path.join(__dirname, 'log')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
aws.config.update({
    secretAccessKey: 'JJpWiJgVGXp6sz20LK227BEHoOxwOfq/ndK+9ald',
    accessKeyId: 'AKIAIV5XFE3SIPNZ4UCA',
    region: 'ap-south-1'
});
s3 = new aws.S3();
var upload = multer({
    storage: multerS3({
        s3: s3,
        dirname: '/pro_pic',
        bucket: 'commonedge-likuid',
        acl: 'public-read',
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            console.log(file);
            fileName = Date.now().toString() + "." + String(file.originalname).split(".").slice(-1)[0]
            console.log(fileName);

            cb(null, fileName); //use Date.now() for unique file keys
        }
    })
});

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
})

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

MongoClient.connect("mongodb://tanjay:tanusha@ds141950.mlab.com:41950/liquiddrive", function(err, db) {
    if (!err) {
        console.log("We are connected");
        var collection = db.collection('test');
        console.log(collection.find)
    }
});



// app.get('/users/verify/:type/:phone', methods.verifyUser);
// //Register a device with a valid token Number
// app.post('/user/update/:token', methods.registerDevice);
// app.post('/vehicle', methods.vehicleRegister);
// app.put('/vehicle/log', methods.logVehicle);
// app.get('/vehicle', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             func.getDrivers(function(er, rows) {
//                 if (!er && rows.length > 0) {
//                     var obj = {
//                         'status': (!err && rows.length) ? "1" : "0",
//                         'message': (!err && rows.length) ? rows : "Oop's No one here"
//                     };
//                     res.json(obj);
//                 } else {

//                 }
//             });
//         } else {
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized Entry: Please Contact the Admin"
//             };
//             res.json(obj);
//         }
//     });
// });
// app.get('/vehicle/:id', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             func.getVehiclesbyID(req.params.id, function(e, rows) {
//                 var obj = {
//                     'status': (!e && rows.length) ? "1" : "0",
//                     'message': (!e && rows.length) ? rows[0] : "Oop's No one here"
//                 };
//                 res.json(obj);
//             });
//         } else {
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized Entry: Please Contact the Admin"
//             };
//             res.json(obj);
//         }
//     });
// });
// app.delete('/users/:id', methods.banUser);
app.post('/users', methods.registerUser);
app.use(function(req, res) {
    func.emailer('Some on is accessing default', 'Some one is accessing the default route on the API', function(e) {
        if (e) {
            console.log("Email Sent");
            console.log("Some on is accessing default");
        } else {
            console.log("Email Failed");
        }
    });
    var obj = {
        'status': "0",
        'message': "Nowhere to go! Are you lost! (PATH NOT FOUND) "
    };
    res.json(obj);
});
app.listen(8000, function() {
    console.log("This is running");
});
