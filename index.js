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


// app.post('/me/avatar', upload.array('upl', 1), function(req, res, next) {
//     console.log(req)
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length > 0) {
//             user = ro[0]['user_id'];
//             func.uploadProPic(user, String(req.files[0].key), function(e, r) {
//                 console.log(e)
//                 if (!e && r.affectedRows > 0) {
//                     var obj = {
//                         'status': "1",
//                         'message': "Pro Pic Updated Successfully!"
//                     };
//                     res.json(obj);
//                 } else {
//                     var obj = {
//                         'status': "0",
//                         'message': "Couldn't update the photo"
//                     };
//                     res.json(obj);
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


// app.post('/todo/:id', function(req, res) {
//     console.log(req)
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length > 0) {
//             user = ro[0]['user_id'];
//             func.getDriverPushRefs(req.params.id, function(er, rr) {
//                 if (!er && rr.length > 0) {
//                     func.setStatusAccept(req.params.id, req.body.status, function(e, r) {
//                         console.log(e)
//                         if (!e && r.affectedRows > 0) {
//                             //**start
//                             title = "Todo Completed!";
//                             message = ro[0]['fName'] + " " + ro[0]['lName'] + ", completed the task \"" + rr[0]['task'] + "\"";
//                             data = {
//                                 'mode': '15',
//                                 'shedule_id': r.insertId,
//                                 'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", completed the task \"" + rr[0]['task'] + "\"",
//                                 'phone': ro[0].phone
//                             };

//                             console.log(data);
//                             console.log(rr[0]['push_ref']);
//                             func.send(rr[0]['push_ref'], title, message, 3, data, function(g) {
//                                 console.log(g);
//                                 if (g) {
//                                     var obj = {
//                                         'status': "1",
//                                         'message': "ToDo Status Changed Successfully!"
//                                     };
//                                     res.json(obj);
//                                 } else {
//                                     func.emailer('Some on is accessing error on trip', "Notification is not sent to driver_id " + req.body.driver_id, function(e) {
//                                         if (e) {
//                                             console.log("Email Sent");
//                                         } else {
//                                             console.log("Email Failed");
//                                         }
//                                         var obj = {
//                                             'status': "2",
//                                             'message': "Trip Created Not Notified"
//                                         };
//                                         res.json(obj);
//                                     });
//                                 }
//                             });

//                             //**end
//                         } else {
//                             var obj = {
//                                 'status': "0",
//                                 'message': "Couldn't update the status"
//                             };
//                             res.json(obj);
//                         }
//                     });
//                 } else {
//                     var obj = {
//                         'status': "0",
//                         'message': "Invalid Todo Item"
//                     };
//                     res.json(obj);
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

// app.get('/my/shedule/:id', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             func.getSheduleFunction(req.params.id, function(e, r) {
//                 if (!e && r.length > 0) {
//                     func.getTODO(req.params.id, function(ee, rr) {
//                         if (!ee && rr.length > 0) {
//                             console.log(r);
//                             console.log({}.toString.call(r).split(' ')[1].slice(0, -1).toLowerCase());
//                             console.log(r[0].from)
//                                 // var k = r;
//                             console.log(moment(dateutil.parse(String(r[0].from))).format('dddd, Do MMMM YYYY'));
//                             r[0]['todos'] = rr;
//                             r[0]['phone'] = String(r[0].phone);
//                             r[0]['pro_pic'] = String(r[0].pro_pic);

//                             r[0]['fromDate'] = moment(dateutil.parse(String(r[0].from))).format('dddd, Do MMMM YYYY');
//                             r[0]['fromTime'] = moment(dateutil.parse(String(r[0].from))).format('hh:mm a');
//                             var obj = {
//                                 'status': "1",
//                                 'message': r
//                             };
//                             res.json(obj);
//                         } else {
//                             r[0]['phone'] = String(r[0].phone);
//                             r[0]['pro_pic'] = String(r[0].pro_pic);
//                             r[0]['fromDate'] = moment(dateutil.parse(String(r[0].from))).format('dddd, Do MMMM YYYY');
//                             r[0]['fromTime'] = moment(dateutil.parse(String(r[0].from))).format('hh:mm a');
//                             r[0]['todos'] = 'No Todos';
//                             var obj = {
//                                 'status': "1",
//                                 'message': r
//                             };
//                             res.json(obj);
//                         }
//                     });
//                 } else {
//                     var obj = {
//                         'status': "0",
//                         'message': "Unauthorized User!"
//                     };
//                     res.json(obj);
//                 }
//             });

//         } else {
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized User!"
//             };
//             res.json(obj);
//         }
//     });

// });

// app.post('/', function(req, res) {
//     // var now = moment(dateutil.parse('2017-5-11 8:13:18')); //tohours date
//     // var end = moment(dateutil.parse('2017-5-11 10:13:18')) // another date
//     // var duration = moment.duration(end.diff(now));
//     // var days = duration.asMinutes();
//     // var f = Number(now.hour()*2)+Number(days/30);
//     // console.log(now.hour()*2+"->"+f)
//     // console.log(days/30)
//     func.getAllDrivers(function(err, rows) {
//         if (err) {

//             res.json(err);
//         } else {

//             // var file = req.files.file;
//             //               fs.readFile(file.path, function (err, data) {
//             //                   if (err) throw err; // Something went wrong!
//             //                   var s3bucket = new AWS.S3({params: {Bucket: 'commonedge-likuid'}});
//             //                   s3bucket.createBucket(function () {
//             //                       var params = {
//             //                           Key: file.originalFilename, //file.name doesn't exist as a property
//             //                           Body: data
//             //                       };
//             //                       s3bucket.upload(params, function (err, data) {
//             //                           // Whether there is an error or not, delete the temp file
//             //                           fs.unlink(file.path, function (err) {
//             //                               if (err) {
//             //                                   console.error(err);
//             //                               }
//             //                               console.log('Temp File Delete');
//             //                           });

//             //                           console.log("PRINT FILE:", file);
//             //                           if (err) {
//             //                               console.log('ERROR MSG: ', err);
//             //                               res.status(500).send(err);
//             //                           } else {
//             //                               console.log('Successfully uploaded data');
//             //                               res.status(200).end();
//             //                           }
//             //                       });
//             //                   });
//             //               });


//             //res.json(rows);
//         }
//     });
// });

// app.get('/my/:day', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             console.log(user)
//             var date1 = moment(dateutil.parse(req.params.day)).format("YYYY-MM-DD 00:00:00")
//             var date2 = moment(dateutil.parse(req.params.day)).add(1, 'days').format("YYYY-MM-DD 00:00:00")
//             console.log(date1)
//             console.log(date2)
//             func.getMyShedulebyDate(user, date1, date2, function(e, r) {
//                 console.log(e)
//                 if (!e && r.length) {
//                     var k = r;
//                     for (var i = r.length - 1; i >= 0; i--) {
//                         console.log(r[i].from);
//                         var a = moment(dateutil.parse(String(r[i].from)));
//                         console.log(a.format("YYYY"))
//                         var now = moment(dateutil.parse(String(String(r[i].from)))); //todays date
//                         console.log(now)
//                         var end = moment(dateutil.parse(String(String(r[i].to)))) // another date
//                         var duration = moment.duration(end.diff(now));
//                         var hours = duration.asMinutes();
//                         var f = Number(now.hour() * 2) + Number(hours / 30);
//                         console.log(now.hour() * 2 + "->" + f)
//                         console.log(hours / 30)
//                         var sDate = moment(dateutil.parse(String(r[i].from)));
//                         r[i]['startDate'] = sDate.format("YYYY-MM-DD");
//                         var sTime = moment(dateutil.parse(String(r[i].from)));
//                         r[i]['startTime'] = sTime.format("hh:mm a");
//                         var eDate = moment(dateutil.parse(String(r[i].from)));
//                         r[i]['endDate'] = moment(dateutil.parse(String(r[i].to))).format("YYYY-MM-DD");
//                         var eTime = moment(dateutil.parse(String(r[i].to)));
//                         r[i]['endTime'] = eTime.format("hh:mm a");
//                         r[i]['startSlot'] = String(Number(now.hour()));
//                         r[i]['endSlot'] = String(f);
//                         //r[i]['todoItems'] = [];
//                         // if(r[i].isTodo == 1){
//                         //   console.log("here");
//                         //               func.getTODO(r[i].shedule_id, function(ee, rr) {
//                         //                 console.log(rr)
//                         //                 if(!ee && rr.length > 0){
//                         //                   r[i]['todoItems'] = rr;
//                         //                 }
//                         //               });

//                         // }
//                     }
//                     var obj = {
//                         'status': "1",
//                         'message': r
//                     };
//                     res.json(obj);
//                 } else {
//                     console.log(err);
//                     var obj = {
//                         'status': "0",
//                         'message': "No Shedule There"
//                     };
//                     res.json(obj);
//                 }
//             })
//         } else {
//             console.log(err);
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized Entry: Please Contact the Admin"
//             };
//             res.json(obj);
//         }
//     });
// });

// app.get('/todo/:id', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             console.log(user)
//             func.getTODO(req.params.id, function(e, r) {
//                 console.log(e)
//                 if (!e && r.length) {
//                     var obj = {
//                         'status': "1",
//                         'message': r
//                     };
//                     res.json(obj);
//                 } else {
//                     console.log(err);
//                     var obj = {
//                         'status': "0",
//                         'message': "No ToDo There"
//                     };
//                     res.json(obj);
//                 }
//             })
//         } else {
//             console.log(err);
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized Entry: Please Contact the Admin"
//             };
//             res.json(obj);
//         }
//     });
// });



// app.get('/history/:request_type/:usertype/page/:page', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         var todo = 0;
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             var page = req.params.page;
//             var per_page = 5;
//             func.getHistory(user, req.params.request_type, req.params.usertype, page, per_page, function(e, r) {
//                 if (!e) {
//                     // var next = "";
//                     // var prev_length_approx = per_page * (page - 1);
//                     // var now_length_approx = per_page * (page);
//                     // if (r.length < now_length_approx && r.length > prev_length_approx)
//                     //     next = -1;
//                     // else if (r.length == now_length_approx)
//                     //     next = (page * 1) + 1;
//                     // else if (r.length < prev_length_approx)
//                     //     next = -2;
//                     func.getHistorySheduled(user, req.params.request_type, req.params.usertype, page, per_page, function(ei, ri) {
//                                                     console.log(ei);
//                         if (!ei && (r.length > 0 || ri.length > 0)) {
//                             console.log(ri)
//                             var last = r.concat(ri);
//                             func.fixdates_in_history(last, function(rr) {
//                                 console.log(rr);
//                                 var next = "";
//                                 var prev_length_approx = per_page * (page - 1);
//                                 var now_length_approx = per_page * (page);
//                                 var new_array = "";
//                                 var stat = false;
//                                 if(rr.length > prev_length_approx){
//                                     if(rr.length < now_length_approx){
//                                         next = -1;
//                                         stat = true;
//                                         new_array = rr.slice(0, rr.length);
//                                         if(req.params.usertype == "driver"){
//                                             if(rr.length == 15 || rr.length > 15)
//                                                 new_array = rr.slice(0, 15);
//                                             else
//                                                 new_array = rr.slice(0, rr.length);
//                                         }
//                                     }
//                                     else{
//                                         stat = true;
//                                         new_array = rr.slice(0, now_length_approx);
//                                         if(req.params.usertype == "driver"){
//                                             if(rr.length == 15 || rr.length > 15)
//                                                 new_array = rr.slice(0, 15);
//                                             else
//                                                 new_array = rr.slice(0, rr.length);
//                                         }
//                                         next = (page*1) + 1;
//                                     }
//                                 }else{
//                                     stat = false;
//                                     next = -1;
//                                 }

//                                 // if (rr.length < now_length_approx && r.length > prev_length_approx)
//                                 //     next = -1;
//                                 // else if (r.length == now_length_approx)
//                                 //     next = (page * 1) + 1;
//                                 // else if (r.length < prev_length_approx)
//                                 //     next = -2;
//                                 var obj = {
//                                     'status': (stat) ? "1" : "0",
//                                     'message': (stat) ? new_array : "No more pages to go" ,
//                                     'next': next
//                                 };
//                                 res.json(obj);
//                             });
//                         } else {
//                             var obj = {
//                                 'status': "0",
//                                 'message': "No history OO"
//                             };
//                             res.json(obj);
//                         }
//                     });
//                 } else {
//                     var obj = {
//                         'status': "0",
//                         'message': "No history"
//                     };
//                     res.json(obj);
//                 }
//             });
//         } else {
//             console.log(err);
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized Entry: Please Contact the Admin"
//             };
//             res.json(obj);
//         }
//     });
// });

// app.post('/shedule', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         var todo = 0;
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             console.log(req.body);
//             func.addShedule(user, req.body, function(e, r) {
//                 if (!e && r.affectedRows > 0) {
//                     if (req.body.todoList && req.body.isTodo > 0) {
//                         var arr = String(req.body.todoList).split(',');
//                         for (var i = 0; i < arr.length; i++) {
//                             func.addTODO(r.insertId, arr[i], function(er, ro) {
//                                 if (!er && ro.affectedRows > 0) todo++;
//                             });
//                         }
//                     }
//                     func.getPrevShedule(req.body.driver_id, req.body.from, function(eprev, prev) {
//                         func.getNextShedule(req.body.driver_id, req.body.to, function(enext, next) {
//                             func.getDriverDeviceFromID(req.body.driver_id, function(ee, rr) {
//                                 if (!ee && rr.length) {
//                                     console.log(eprev)
//                                     console.log(enext)
//                                     console.log(prev)
//                                     console.log(next)
//                                     console.log(next.length)
//                                     var now = moment(dateutil.parse(String(req.body.from))); //todays date
//                                     var end = moment(dateutil.parse(String(req.body.to))) // another date
//                                     var duration = moment.duration(end.diff(now));
//                                     var hours = duration.asMinutes();
//                                     var f = Number(now.hour() * 2) + Number(hours / 30);
//                                     console.log(now.hour() * 2 + "->" + f)
//                                     console.log(hours / 30)
//                                     title = "Shedule Confirmation!";
//                                     message = ro[0]['fName'] + " " + ro[0]['lName'] + ", made an shedule request!";
//                                     data = {
//                                         'mode': '9',
//                                         'shedule_id': r.insertId,
//                                         'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", made an shedule request!",
//                                         'lat': String(req.body.start_lat),
//                                         'lng': String(req.body.start_lng),
//                                         'fromDate': String(now.format("YYYY:MM:DD")),
//                                         'fromTime': String(now.format("hh:mm:ss a")),
//                                         'isPrev': (prev.length <= 0) ? "0" : "1",
//                                         'prevfromDate': (prev.length <= 0) ? "0" : moment(dateutil.parse(String(prev[0].from))).format("YYYY-MM-DD"),
//                                         'prevfromTime': (prev.length <= 0) ? "0" : moment(dateutil.parse(String(prev[0].from))).format("hh:mm:ss a"),
//                                         'prevLat': (prev.length <= 0) ? "0" : prev[0].passenger_start_lat,
//                                         'prevLng': (prev.length <= 0) ? "0" : prev[0].passenger_start_lng,
//                                         'duration': hours,
//                                         'place_id': String(req.body.place_id),
//                                         'place_name' : String(req.body.place_name),
//                                         'place_address' : String(req.body.place_address),
//                                         'dest_id': String(req.body.dest_id),
//                                         'dest_name' : String(req.body.dest_name),
//                                         'dest_address' : String(req.body.dest_address),
//                                         'isNext': (next.length <= 0) ? "0" : "1",
//                                         'nextfromTime': (next.length <= 0) ? "0" : moment(dateutil.parse(String(next[0].from))).format("YYYY-MM-DD"),
//                                         'nextfromTime': (next.length <= 0) ? "0" : moment(dateutil.parse(String(next[0].from))).format("hh:mm:ss a"),
//                                         'nextLat': (next.length <= 0) ? "0" : next[0].passenger_start_lat,
//                                         'nextLng': (next.length <= 0) ? "0" : next[0].passenger_start_lng,
//                                         'isTODO': String(req.body.isTodo),
//                                         'phone': ro[0].phone,
//                                         'todoList': (req.body.todoList) ? String(req.body.todoList) : "None"
//                                     };
//                                     console.log(data);
//                                     console.log(rr[0]['push_ref']);
//                                     func.send(rr[0]['push_ref'], title, message, 3, data, function(g) {
//                                         console.log(g);
//                                         if (g) {
//                                             var obj = {
//                                                 'status': "1",
//                                                 'message': (req.body.todoList) ? "Shedule created and Added " + arr.length + " todo list items" : "Shedule Created"
//                                             };
//                                             res.json(obj);
//                                         } else {
//                                             func.emailer('Some on is accessing error on trip', "Notification is not sent to driver_id " + req.body.driver_id, function(e) {
//                                                 if (e) {
//                                                     console.log("Email Sent");
//                                                 } else {
//                                                     console.log("Email Failed");
//                                                 }
//                                                 var obj = {
//                                                     'status': "2",
//                                                     'message': "Trip Created Not Notified"
//                                                 };
//                                                 res.json(obj);
//                                             });
//                                         }
//                                     });

//                                 } else {
//                                     var obj = {
//                                         'status': "1",
//                                         'message': "The Notification Failed bt the shedule is created!"
//                                     };
//                                     res.json(obj);
//                                 }
//                             });
//                         });
//                     });
//                 } else {
//                     console.log(e);
//                     var obj = {
//                         'status': "0",
//                         'message': "Shedule Not Created"
//                     };
//                     res.json(obj);
//                 }
//             });
//         } else {
//             console.log(err);
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized Entry: Please Contact the Admin"
//             };
//             res.json(obj);
//         }
//     });
// });

// app.get('/driver/:id', function(req, res) {
//     if (req.params.id) {
//         var user = "";
//         console.log(req.query.key);
//         func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//             if (!err && ro.length) {
//                 user = ro[0]['user_id'];
//                 console.log(user);
//                 func.getDriversById(req.params.id, function(err, rows) {
//                     var obj = {
//                         'status': (!err && rows.length) ? "1" : "0",
//                         'message': (!err && rows.length) ? rows[0] : "Oop's No one here"
//                     };
//                     res.json(obj);
//                 });
//             } else {
//                 console.log(err);
//                 var obj = {
//                     'status': "0",
//                     'message': "Unauthorized Entry: Please Contact the Admin"
//                 };
//                 res.json(obj);
//             }
//         });
//     }
// });

// app.get('/shedule', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             console.log(user)
//             func.getMyShedule(user, function(e, r) {
//                 console.log(e)
//                 if (!e && r.length) {
//                     var obj = {
//                         'status': "1",
//                         'message': r
//                     };
//                     res.json(obj);
//                 } else {
//                     console.log(err);
//                     var obj = {
//                         'status': "0",
//                         'message': "No Shedule There"
//                     };
//                     res.json(obj);
//                 }
//             })
//         } else {
//             console.log(err);
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized Entry: Please Contact the Admin"
//             };
//             res.json(obj);
//         }
//     });
// });



// app.get('/driver/shedule/:id', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             console.log(user)
//             func.getMyShedule(req.params.id, function(e, r) {
//                 console.log(e)
//                 console.log(r)

//                 if (!e && r.length) {
//                     var obj = {
//                         'status': "1",
//                         'message': r
//                     };
//                     res.json(obj);
//                 } else {
//                     console.log(err);
//                     var obj = {
//                         'status': "0",
//                         'message': "No Shedule There"
//                     };
//                     res.json(obj);
//                 }
//             })
//         } else {
//             console.log(err);
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized Entry: Please Contact the Admin"
//             };
//             res.json(obj);
//         }
//     });
// });

// app.get('/shedule/driver/from/:from/to/:to', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             console.log(req.params.from + " " + req.params.to)
//             func.getSheduleDrivers(req.params.from, req.params.to, function(er, roo) {
//                 console.log(er)
//                 if (!er && roo.length > 0) {
//                     var obj = {
//                         'status': "1",
//                         'message': roo
//                     };
//                     res.json(obj);
//                 } else {
//                     var obj = {
//                         'status': "0",
//                         'message': "Seems Every one is busy!"
//                     };
//                     res.json(obj);
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
// app.get('/cancel/:id', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             console.log(user + " " + req.params.id)
//             func.getCancelID(req.params.id, function(errr, rr) {
//                 if (!errr && rr.length) {
//                     func.cancelRide(user, req.params.id, function(e, r) {
//                         console.log(r);
//                         console.log(e);
//                         if (!e && r.affectedRows > 0) {
//                             title = "Trip Cancelled!";
//                             message = ro[0]['fName'] + " " + ro[0]['lName'] + ", cancelled your request (Vehicle No: " + ro[0]['plate_no'] + ").";
//                             data = {
//                                 'mode': (rr[0]['driver_approval']) ? '13' : '6',
//                                 'ride_id': r.affectedRows,
//                                 'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", cancelled your request (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                 'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                 'phone': ro[0]['phone'],
//                                 'pro_pic': ro[0]['pro_pic']
//                             };
//                             func.getOwnerDeviceOnCancel(req.params.id, function(n, y) {
//                                 if (!n && y.length) {
//                                     func.send(y[0]['push_ref'], title, message, 3, data, function(g) {
//                                         if (g) {
//                                             var obj = {
//                                                 'status': "1",
//                                                 'message': "Rider Responded!"
//                                             };
//                                             res.json(obj);
//                                         } else {
//                                             func.emailer('Some on is accessing error on trip', "Notification is not sent to driver_id " + req.body.driver_id, function(e) {
//                                                 if (e) {
//                                                     console.log("Email Sent");
//                                                 } else {
//                                                     console.log("Email Failed");
//                                                 }
//                                             });
//                                             console.log("sad");
//                                             var obj = {
//                                                 'status': "2",
//                                                 'message': "Trip Created Not Notified"
//                                             };
//                                             res.json(obj);
//                                         }
//                                     });
//                                 } else {
//                                     var obj = {
//                                         'status': "0",
//                                         'message': "Couldn't grab the reference of the driver"
//                                     };
//                                     res.json(obj);
//                                 }
//                             });
//                         } else {
//                             var obj = {
//                                 'status': "0",
//                                 'message': "Something happened!"
//                             };
//                             res.json(obj);
//                         }
//                     });
//                 } else {
//                     var obj = {
//                         'status': "0",
//                         'message': "Couldn't get the status id!"
//                     };
//                     res.json(obj);
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

// //cancel shedule
// app.get('/sheduled/cancel/:id', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             console.log(user + " " + req.params.id)
//             func.getCancelIDShedule(req.params.id, function(errr, rr) {
//                 console.log(errr)
//                 if (!errr && rr.length) {
//                     func.cancelShedule(rr[0]['driver_id'], req.params.id, function(e, r) {
//                         console.log(r);
//                         console.log(e);
//                         if (!e && r.affectedRows > 0) {
//                             title = "Trip Cancelled!";
//                             message = ro[0]['fName'] + " " + ro[0]['lName'] + ", cancelled your shedule request (Vehicle No: " + ro[0]['plate_no'] + ").";
//                             data = {
//                                 'mode': '13',
//                                 'ride_id': r.affectedRows,
//                                 'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", cancelled your shedule request (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                 'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                 'phone': ro[0]['phone'],
//                                 'pro_pic': ro[0]['pro_pic']
//                             };
//                             func.getOwnerDeviceOnCancelShedule(req.params.id, function(n, y) {
//                                 if (!n && y.length) {
//                                     func.send(y[0]['push_ref'], title, message, 3, data, function(g) {
//                                         if (g) {
//                                             var obj = {
//                                                 'status': "1",
//                                                 'message': "Rider Responded!"
//                                             };
//                                             res.json(obj);
//                                         } else {
//                                             func.emailer('Some on is accessing error on trip', "Notification is not sent to driver_id " + req.body.driver_id, function(e) {
//                                                 if (e) {
//                                                     console.log("Email Sent");
//                                                 } else {
//                                                     console.log("Email Failed");
//                                                 }
//                                             });
//                                         }
//                                     });
//                                 } else {
//                                     var obj = {
//                                         'status': "0",
//                                         'message': "Couldn't grab the reference of the driver"
//                                     };
//                                     res.json(obj);
//                                 }
//                             });
//                         } else {
//                             var obj = {
//                                 'status': "0",
//                                 'message': "Something happened!"
//                             };
//                             res.json(obj);
//                         }
//                     });
//                 } else {
//                     var obj = {
//                         'status': "0",
//                         'message': "Couldn't get the status id!"
//                     };
//                     res.json(obj);
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




// app.get('/state/:usertype', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             if (req.params.usertype == 'owner') {
//                 func.getTripState(user, function(e, r) {
//                     if (!e && r.length > 0) {
//                         var obj = {
//                             'status': "1",
//                             'message': r[0]
//                         };
//                         res.json(obj);
//                     } else {
//                         func.getSheduleState(user, function(ee, rr) {
//                             if (!ee && rr.length > 0) {
//                                 var obj = {
//                                     'status': "1",
//                                     'message': rr[0]
//                                 };
//                                 res.json(obj);
//                             } else {

//                                 var obj = {
//                                     'status': "0",
//                                     'message': req.params.usertype + " state not recieved!"
//                                 };
//                                 res.json(obj);
//                             }
//                         });
//                     }
//                 });
//             } else if (req.params.usertype == 'driver') {
//                 func.getStateDriver(user, function(e, r) {
//                     //getStateSheduledDriver
//                     if (!e && r.length > 0) {
//                         var obj = {
//                             'status': "1",
//                             'message': r[0]
//                         };
//                         res.json(obj);
//                     } else {
//                         func.getStateSheduledDriver(user, function(ee, rr) {
//                             if (!ee && rr.length > 0) {
//                                 var obj = {
//                                     'status': "1",
//                                     'message': rr[0]
//                                 };
//                                 res.json(obj);
//                             } else {
//                                 var obj = {
//                                     'status': "0",
//                                     'message': req.params.usertype + " state not recieved!"
//                                 };
//                                 res.json(obj);
//                             }
//                         });
//                     }
//                 });
//             } else {
//                 var obj = {
//                     'status': "0",
//                     'message': req.params.usertype + " is not a user type"
//                 };
//                 res.json(obj);
//             }
//         } else {
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized Entry: Please Contact the Admin"
//             };
//             res.json(obj);
//         }
//     });
// });
// app.get('/status/:state', function(req, res) {
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length && req.params.state) {
//             user = ro[0]['user_id'];
//             func.stateChange(req.query.key, req.params.state, function(e, r) {
//                 if (!e && r.affectedRows > 0) {
//                     var obj = {
//                         'status': "1",
//                         'message': "State Changed!"
//                     };
//                     res.json(obj);
//                 } else {
//                     var obj = {
//                         'status': "0",
//                         'message': "State Not Changed!"
//                     };
//                     res.json(obj);

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



// //Shedule State
// app.get('/shedule/:state/:id', function(req, res) {
//     console.log(req.params.state);
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             console.log(String(ro[0]['vehicle_id']));
//             user = ro[0]['user_id'];
//             var status = "0";
//             var approval = "0";
//             if (req.params.state == 'accept') {
//                 approval = "-1";
//                 status = "1";
//                 console.log("accept");
//             } else if (req.params.state == 'decline') {
//                 approval = "-1";
//                 status = "-2";
//             } else if (req.params.state == 'end') {
//                 approval = "-4";
//                 status = "-3";
//             } else if (req.params.state == 'start') {
//                 approval = "-6";
//                 status = "-4";
//             } else if(req.params.state == 'arrived'){
//                  approval = "-6";
//                  status = "-8";
//             } else if (req.params.state == 'begin') {
//                 approval = "1";
//                 status = "-6";
//             } else {
//                 var obj = {
//                     'status': "0",
//                     'message': "Unidentified State"
//                 };
//                 res.json(obj);
//             }
//             console.log(user);
//             func.getShedulebyID(user, approval, req.params.id, function(e, roo) {
//                 console.log(roo)
//                 if (!e && roo.length) {
//                     func.updateShedule(user, req.params.id, status, approval, function(el, r) {
//                         console.log(r)
//                         if (!e && r.affectedRows > 0) {
//                             var title = "You rider have " + req.params.state;
//                             var message = "Have a nice Day!";
//                             console.log(roo[0]['push_ref']);
//                             var data = null;
//                             if (status == '1') {
//                                 title = "shedule Confirmed!";
//                                 message = ro[0]['fName'] + " " + ro[0]['lName'] + ", accepted your request (Vehicle No: " + ro[0]['plate_no'] + ").";
//                                 data = {
//                                     'mode': '10',
//                                     'title': 'Your Shedule is confirmed!',
//                                     'ride_id': String(req.params.id),
//                                     'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", accepted your request (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     'orgLat': roo[0]['passenger_start_lat'],
//                                     'orgLng': roo[0]['passenger_start_lng'],
//                                     'destLat': roo[0]['passenger_end_lat'],
//                                     'destLng': roo[0]['passenger_end_lng'],
//                                     'place_id': String(roo[0]['place_id']),
//                                     'dest_id': String(roo[0]['dest_id']),
//                                     'dest_name' : String(roo[0]['dest_name']),
//                                     'dest_address' : String(roo[0]['dest_address']),
//                                     'place_name' : String(roo[0]['place_name']),
//                                     'place_address' : String(roo[0]['place_address']),
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],
//                                     'pro_pic': ro[0]['pro_pic']
//                                 };
//                             } else if (status == '-2') {
//                                 title = "shedule Declined!";
//                                 message = ro[0]['fName'] + " " + ro[0]['lName'] + ", declined your request (Vehicle No: " + ro[0]['plate_no'] + ").";
//                                 data = {
//                                     'mode': '10',
//                                     'title': 'Your Shedule is declined!',
//                                     'ride_id': String(req.params.id),
//                                     'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", declined your request (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     'orgLat': roo[0]['passenger_start_lat'],
//                                     'orgLng': roo[0]['passenger_start_lng'],
//                                     'destLat': roo[0]['passenger_end_lat'],
//                                     'destLng': roo[0]['passenger_end_lng'],
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],
//                                     'pro_pic': ro[0]['pro_pic']
//                                 };
//                             } else if (status == '-3') {
//                                 title = "shedule Ended!";
//                                 message = "Thanks For using our service have a nice day!";
//                                 data = {
//                                     'mode': '8',
//                                     'ride_id': String(req.params.id),
//                                     'message': "Thanks For using our service have a nice day!",
//                                     'lat': roo[0]['last_lat'],
//                                     'lng': roo[0]['last_lng'],
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],
//                                     'pro_pic': ro[0]['pro_pic']
//                                 };
//                             } else if (status == '-4') {
//                                 title = "shedule Started!";
//                                 message = ro[0]['fName'] + " " + ro[0]['lName'] + ", started your shedule (Vehicle No: " + ro[0]['plate_no'] + ").";
//                                 data = {
//                                     'mode': '7',
//                                     // 'driver_id': ro[0]['user_id'],
//                                     // 'ride_id': String(req.params.id),
//                                     // 'vehicle_id': String(ro[0]['vehicle_id']),
//                                     // 'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", started your shedule (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     // 'lat': roo[0]['last_lat'],
//                                     // 'lng': roo[0]['last_lng'],
//                                     // 'end_lat': roo[0]['passenger_end_lat'],
//                                     // 'end_lng': roo[0]['passenger_end_lng'],
//                                     // 'model': ro[0]['model'],
//                                     // 'plate_no': ro[0]['plate_no'],
//                                     // 'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     // 'phone': ro[0]['phone'],
//                                     // 'pro_pic': ro[0]['pro_pic']

//                                     "isSheduled": "1",
//                                     'driver_id': ro[0]['user_id'],
//                                     'ride_id': String(req.params.id),
//                                     'vehicle_id': String(ro[0]['vehicle_id']),
//                                     'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", started your trip (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     'lat': roo[0]['last_lat'],
//                                     'lng': roo[0]['last_lng'],
//                                     'place_id': String(roo[0]['place_id']),
//                                     'place_name' : String(roo[0]['place_name']),
//                                     'place_address' : String(roo[0]['place_address']),
//                                     'dest_id': String(roo[0]['dest_id']),
//                                     'dest_name' : String(roo[0]['dest_name']),
//                                     'dest_address' : String(roo[0]['dest_address']),
//                                     'end_lat': roo[0]['passenger_end_lat'],
//                                     'end_lng': roo[0]['passenger_end_lng'],
//                                     'myLat': roo[0]['passenger_start_lat'],
//                                     'myLng': roo[0]['passenger_start_lng'],
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],

//                                     'pro_pic': ro[0]['pro_pic']
//                                 };
//                             } else if (status == '-8') {
//                                 title = "Driver Arrived!";
//                                 message = ro[0]['fName'] + " " + ro[0]['lName'] + ", arrived to your location (Vehicle No: " + ro[0]['plate_no'] + ").";
//                                 data = {
//                                     'mode': '29',
//                                     // 'driver_id': ro[0]['user_id'],
//                                     // 'ride_id': String(req.params.id),
//                                     // 'vehicle_id': String(ro[0]['vehicle_id']),
//                                     // 'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", started your shedule (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     // 'lat': roo[0]['last_lat'],
//                                     // 'lng': roo[0]['last_lng'],
//                                     // 'end_lat': roo[0]['passenger_end_lat'],
//                                     // 'end_lng': roo[0]['passenger_end_lng'],
//                                     // 'model': ro[0]['model'],
//                                     // 'plate_no': ro[0]['plate_no'],
//                                     // 'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     // 'phone': ro[0]['phone'],
//                                     // 'pro_pic': ro[0]['pro_pic']

//                                     "isSheduled": "1",
//                                     'driver_id': ro[0]['user_id'],
//                                     'ride_id': String(req.params.id),
//                                     'vehicle_id': String(ro[0]['vehicle_id']),
//                                     'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", arrived to your location (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     'lat': roo[0]['last_lat'],
//                                     'lng': roo[0]['last_lng'],
//                                     'end_lat': roo[0]['passenger_end_lat'],
//                                     'end_lng': roo[0]['passenger_end_lng'],
//                                     'myLat': roo[0]['passenger_start_lat'],
//                                     'myLng': roo[0]['passenger_start_lng'],
//                                     'place_id': String(roo[0]['place_id']),
//                                     'place_name' : String(roo[0]['place_name']),
//                                     'place_address' : String(roo[0]['place_address']),
//                                     'dest_id': String(roo[0]['dest_id']),
//                                     'dest_name' : String(roo[0]['dest_name']),
//                                     'dest_address' : String(roo[0]['dest_address']),
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],
//                                     'pro_pic': ro[0]['pro_pic']
//                                 };
//                             } else if (status == '-6') {
//                                 title = "Shedule Begun!";
//                                 message = ro[0]['fName'] + " " + ro[0]['lName'] + ", Begun your request (Vehicle No: " + ro[0]['plate_no'] + ").";
//                                 data = {
//                                     'mode': '3',
//                                     'isSheduled': '1',
//                                     // 'ride_id': String(req.params.id),
//                                     // 'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", Begun your request (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     // 'lat': roo[0]['last_lat'],
//                                     // 'lng': roo[0]['last_lng'],
//                                     // 'myLat': roo[0]['passenger_start_lat'],
//                                     // 'myLng': roo[0]['passenger_start_lng'],
//                                     // 'model': ro[0]['model'],
//                                     // 'plate_no': ro[0]['plate_no'],
//                                     // 'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     // 'phone': ro[0]['phone'],
//                                     // 'pro_pic': ro[0]['pro_pic']

//                                     'driver_id': user,
//                                     'vehicle_id': String(ro[0]['vehicle_id']),
//                                     'ride_id': String(req.params.id),
//                                     'end_lat': roo[0]['passenger_end_lat'],
//                                     'end_lng': roo[0]['passenger_end_lng'],
//                                     'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", accepted your request (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     'lat': roo[0]['last_lat'],
//                                     'lng': roo[0]['last_lng'],
//                                     'myLat': roo[0]['passenger_start_lat'],
//                                     'myLng': roo[0]['passenger_start_lng'],
//                                     'place_id': String(roo[0]['place_id']),
//                                     'place_name' : String(roo[0]['place_name']),
//                                     'place_address' : String(roo[0]['place_address']),
//                                     'dest_id': String(roo[0]['dest_id']),
//                                     'dest_name' : String(roo[0]['dest_name']),
//                                     'dest_address' : String(roo[0]['dest_address']),
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],
//                                     'pro_pic': ro[0]['pro_pic']


//                                 };
//                             }
//                             func.send(roo[0]['push_ref'], title, message, 3, data, function(g) {
//                                 if (g) {
//                                     var obj = {
//                                         'status': "1",
//                                         'ride_id': String(req.params.id),
//                                         'message': "Rider Responded!"
//                                     };
//                                     res.json(obj);
//                                 } else {
//                                     func.emailer('Some on is accessing error on shedule', "Notification is not sent to driver_id " + req.body.driver_id, function(e) {
//                                         if (e) {
//                                             console.log("Email Sent");
//                                         } else {
//                                             console.log("Email Failed");
//                                         }
//                                     });
//                                     console.log("sad");
//                                     var obj = {
//                                         'status': "2",
//                                         'message': "shedule Created Not Notified"
//                                     };
//                                     res.json(obj);
//                                 }
//                             });
//                         } else {
//                             var obj = {
//                                 'status': "0",
//                                 'message': "Couldn't update the Driver"
//                             };
//                             res.json(obj);
//                         }
//                     });
//                 } else {
//                     var obj = {
//                         'status': "0",
//                         'message': "Invalid Ride ID"
//                     };
//                     res.json(obj);
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
// app.get('/trip/:state/:id', function(req, res) {
//     console.log(req.params.state);
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             console.log(String(ro[0]['vehicle_id']));
//             user = ro[0]['user_id'];
//             var status = "0";
//             var approval = "0";
//             if (req.params.state == 'accept') {
//                 approval = "0";
//                 status = "1";
//                 console.log("accept");
//             // } else if (req.params.state == 'arrived') {
//             //     approval = "1";
//             //     status = "-8";
//             } else if (req.params.state == 'decline') {
//                 approval = "0";
//                 status = "-2";
//             } else if (req.params.state == 'end') {
//                 approval = "-4";
//                 status = "-3";
//             } else if (req.params.state == 'start') {
//                 approval = "1";
//                 status = "-4";
//             } else if (req.params.state == 'cancel') {
//                 approval = "1";
//                 status = "-5";
//             } else {
//                 var obj = {
//                     'status': "0",
//                     'message': "Unidentified State"
//                 };
//                 res.json(obj);
//             }
//             func.getRideShedule(user, approval, req.params.id, function(e, roo) {
//                 console.log(e)
//                 console.log(roo)
//                 if (!e && roo.length) {
//                     func.updateRide(user, req.params.id, status, approval, function(e, r) {
//                         console.log(e)
//                         console.log(r)
//                         if (!e && r.affectedRows > 0) {
//                             var title = "You rider have " + req.params.state;
//                             var message = "Have a nice Day!";
//                             console.log(roo[0]['push_ref']);
//                             var data = null;
//                             if (status == '1') {
//                                 title = "Trip Confirmed!";
//                                 message = ro[0]['fName'] + " " + ro[0]['lName'] + ", accepted your request (Vehicle No: " + ro[0]['plate_no'] + ").";
//                                 data = {
//                                     'mode': '3',
//                                     "isSheduled": "0",
//                                     'driver_id': user,
//                                     'vehicle_id': String(ro[0]['vehicle_id']),
//                                     'ride_id': String(req.params.id),
//                                     'end_lat': roo[0]['passenger_end_lat'],
//                                     'end_lng': roo[0]['passenger_end_lng'],
//                                     'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", accepted your request (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     'lat': roo[0]['last_lat'],
//                                     'lng': roo[0]['last_lng'],
//                                     'myLat': roo[0]['passenger_origin_lat'],
//                                     'myLng': roo[0]['passenger_origin_lng'],
//                                     'place_id': String(roo[0]['place_id']),
//                                     'place_name' : String(roo[0]['place_name']),
//                                     'place_address' : String(roo[0]['place_address']),
//                                     'dest_id': String(roo[0]['dest_id']),
//                                     'dest_name' : String(roo[0]['dest_name']),
//                                     'dest_address' : String(roo[0]['dest_address']),
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],
//                                     'pro_pic': ro[0]['pro_pic']
//                                 };
//                             } else if (status == '-2') {
//                                 title = "Trip Declined!";
//                                 message = ro[0]['fName'] + " " + ro[0]['lName'] + ", declined your request (Vehicle No: " + ro[0]['plate_no'] + ").";
//                                 data = {
//                                     'mode': '4',
//                                     'ride_id': String(req.params.id),
//                                     'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", declined your request (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     'lat': roo[0]['last_lat'],
//                                     'lng': roo[0]['last_lng'],
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],
//                                     'pro_pic': ro[0]['pro_pic']
//                                 };
//                             } else if (status == '-3') {
//                                 title = "Trip Ended!";
//                                 message = "Thanks For using our service have a nice day!";
//                                 data = {
//                                     'mode': '8',
//                                     'ride_id': String(req.params.id),
//                                     'message': "Thanks For using our service have a nice day!",
//                                     'lat': roo[0]['last_lat'],
//                                     'lng': roo[0]['last_lng'],
//                                     'place_id': String(roo[0]['place_id']),
//                                     'place_name' : String(roo[0]['place_name']),
//                                     'place_address' : String(roo[0]['place_address']),
//                                     'dest_id': String(roo[0]['dest_id']),
//                                     'dest_name' : String(roo[0]['dest_name']),
//                                     'dest_address' : String(roo[0]['dest_address']),
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],
//                                     'pro_pic': ro[0]['pro_pic']
//                                 };
//                             // } else if (status == '-8') {
//                             //     title = "Driver Arrived!";
//                             //     message = ro[0]['fName'] + " " + ro[0]['lName'] + ", arrive to your trip (Vehicle No: " + ro[0]['plate_no'] + ").";
//                             //     data = {
//                             //         'mode': '29',
//                             //         "isSheduled": "0",
//                             //         'driver_id': ro[0]['user_id'],
//                             //         'ride_id': String(req.params.id),
//                             //         'vehicle_id': String(ro[0]['vehicle_id']),
//                             //         'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", started your trip (Vehicle No: " + ro[0]['plate_no'] + ").",
//                             //         'lat': roo[0]['last_lat'],
//                             //         'lng': roo[0]['last_lng'],
//                             //         'end_lat': roo[0]['passenger_end_lat'],
//                             //         'end_lng': roo[0]['passenger_end_lng'],
//                             //         'myLat': roo[0]['passenger_origin_lat'],
//                             //         'myLng': roo[0]['passenger_origin_lng'],
//                             //         'model': ro[0]['model'],
//                             //         'plate_no': ro[0]['plate_no'],
//                             //         'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                             //         'phone': ro[0]['phone'],

//                             //         'pro_pic': ro[0]['pro_pic']
//                             //     };
//                             } else if (status == '-4') {
//                                 title = "Trip Started!";
//                                 message = ro[0]['fName'] + " " + ro[0]['lName'] + ", started your trip (Vehicle No: " + ro[0]['plate_no'] + ").";
//                                 data = {
//                                     'mode': '7',
//                                     "isSheduled": "0",
//                                     'driver_id': ro[0]['user_id'],
//                                     'ride_id': String(req.params.id),
//                                     'vehicle_id': String(ro[0]['vehicle_id']),
//                                     'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", started your trip (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     'lat': roo[0]['last_lat'],
//                                     'lng': roo[0]['last_lng'],
//                                     'place_id': String(roo[0]['place_id']),
//                                     'place_name' : String(roo[0]['place_name']),
//                                     'place_address' : String(roo[0]['place_address']),
//                                     'dest_id': String(roo[0]['dest_id']),
//                                     'dest_name' : String(roo[0]['dest_name']),
//                                     'dest_address' : String(roo[0]['dest_address']),
//                                     'end_lat': roo[0]['passenger_end_lat'],
//                                     'end_lng': roo[0]['passenger_end_lng'],
//                                     'myLat': roo[0]['passenger_origin_lat'],
//                                     'myLng': roo[0]['passenger_origin_lng'],
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],

//                                     'pro_pic': ro[0]['pro_pic']
//                                 };
//                             } else if (status == '-5') {
//                                 title = "Trip Cancelled!";
//                                 message = ro[0]['fName'] + " " + ro[0]['lName'] + ", cancelled your request (Vehicle No: " + ro[0]['plate_no'] + ").";
//                                 data = {
//                                     'mode': '4',
//                                     'ride_id': String(req.params.id),
//                                     'message': ro[0]['fName'] + " " + ro[0]['lName'] + ", cancelled your request (Vehicle No: " + ro[0]['plate_no'] + ").",
//                                     'lat': roo[0]['last_lat'],
//                                     'lng': roo[0]['last_lng'],
//                                     'model': ro[0]['model'],
//                                     'plate_no': ro[0]['plate_no'],
//                                     'name': ro[0]['fName'] + " " + ro[0]['lName'],
//                                     'phone': ro[0]['phone'],
//                                     'pro_pic': ro[0]['pro_pic']
//                                 };
//                             }
//                             func.send(roo[0]['push_ref'], title, message, 3, data, function(g) {
//                                 if (g) {
//                                     var obj = {
//                                         'status': "1",
//                                         'ride_id': String(req.params.id),
//                                         'message': "Rider Responded!"
//                                     };
//                                     res.json(obj);
//                                 } else {
//                                     func.emailer('Some on is accessing error on trip', "Notification is not sent to driver_id " + req.body.driver_id, function(e) {
//                                         if (e) {
//                                             console.log("Email Sent");
//                                         } else {
//                                             console.log("Email Failed");
//                                         }
//                                     });
//                                     console.log("sad");
//                                     var obj = {
//                                         'status': "2",
//                                         'message': "Trip Created Not Notified"
//                                     };
//                                     res.json(obj);
//                                 }
//                             });
//                         } else {
//                             var obj = {
//                                 'status': "0",
//                                 'message': "Couldn't update the Driver"
//                             };
//                             res.json(obj);
//                         }
//                     });
//                 } else {
//                     var obj = {
//                         'status': "0",
//                         'message': "Invalid Ride ID"
//                     };
//                     res.json(obj);
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
// app.get('/owner/:id', function(req, res) {
//     if (req.params.id) {
//         var user = "";
//         console.log(req.query.key);
//         func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//             if (!err && ro.length) {
//                 user = ro[0]['user_id'];
//                 console.log(user);
//                 func.getOwnerById(req.params.id, function(err, rows) {
//                     var obj = {
//                         'status': (!err && rows.length) ? "1" : "0",
//                         'message': (!err && rows.length) ? rows : "Oop's No one here"
//                     };
//                     res.json(obj);
//                 });
//             } else {
//                 console.log(err);
//                 var obj = {
//                     'status': "0",
//                     'message': "Unauthorized Entry: Please Contact the Admin"
//                 };
//                 res.json(obj);
//             }
//         });
//     }
// });


// app.get('/me', function(req, res) {
//     var user = "";
//     console.log(req.query.key);
//     func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//         if (!err && ro.length) {
//             user = ro[0]['user_id'];
//             plate_no = ro[0]['plate_no'];
//             console.log(user);
//             console.log(plate_no);
//             if(plate_no)
//                 func.getDriversById(user, function(err, rows) {
//                     var obj = {
//                         'status': (!err && rows.length) ? "1" : "0",
//                         'message': (!err && rows.length) ? rows : "Oop's No one here"
//                     };
//                     res.json(obj);
//                 });
//             else
//                 func.getOwnerById(user, function(err, rows) {
//                     var obj = {
//                         'status': (!err && rows.length) ? "1" : "0",
//                         'message': (!err && rows.length) ? rows : "Oop's No one here"
//                     };
//                     res.json(obj);
//                 });
//         } else {
//             console.log(err);
//             var obj = {
//                 'status': "0",
//                 'message': "Unauthorized Entry: Please Contact the Admin"
//             };
//             res.json(obj);
//         }
//     });
// });

// //Generate a token to register the device for a pre-reg user
// app.post('/trip', function(req, res) {
//     if (req.body) {
//         func.getUserbyAPIKEY(req.query.key, function(err, ro) {
//             if (!err && ro.length) {
//                 user = ro[0]['user_id'];
//                 console.log(user);
//                 func.createInstantTrip(user, req.body, function(error, row) {
//                     if (!error && row.affectedRows > 0) {
//                         func.getDriverDeviceFromID(req.body.driver_id, function(e, r) {
//                             if (!e && r.length) {
//                                 var title = "You pending ride request from " + ro[0]['fName'] + " " + ro[0]['lName'];
//                                 var message = "Please confirm the ride! For more info contact " + ro[0]['phone'];
//                                 console.log(r[0]['push_ref']);
//                                 console.log(title);
//                                 console.log(message);
//                                 var data = {
//                                     'mode': '5',
//                                     'ride_id': String(row.insertId),
//                                     'passenger_id': ro[0]['user_id'],
//                                     'lat': req.body.lat,
//                                     'lng': req.body.lng,
//                                     'final_lat': req.body.endlat,
//                                     'final_lng': req.body.endlng,
//                                     'place_id': String(req.body.place_id),
//                                     'place_name' : String(req.body.place_name),
//                                     'place_address' : String(req.body.place_address),
//                                     'dest_id': String(req.body.dest_id),
//                                     'dest_name' : String(req.body.dest_name),
//                                     'dest_address' : String(req.body.dest_address),
//                                     'name': ro[0]['fName'],
//                                 };
//                                 console.log(r[0]['push_ref']);
//                                 func.send(r[0]['push_ref'], title, message, 5, data, function(g) {
//                                     if (g) {
//                                         var obj = {
//                                             'status': "1",
//                                             'ride_id': String(row.insertId),
//                                             'message': "Trip Created Successfully"
//                                         };
//                                         res.json(obj);
//                                         console.log("sad");
//                                     } else {
//                                         func.emailer('Some on is accessing error on trip', "Notification is not sent to driver_id " + req.body.driver_id, function(e) {
//                                             if (e) {
//                                                 console.log("Email Sent");
//                                             } else {
//                                                 console.log("Email Failed");
//                                             }
//                                         });
//                                         console.log("sad");
//                                         var obj = {
//                                             'status': "0",
//                                             'message': "Trip Created Not Notified"
//                                         };
//                                         res.json(obj);
//                                     }
//                                 });
//                             }
//                         });
//                     } else {
//                         func.emailer('Some on is accessing error on trip', error, function(e) {
//                             if (e) {
//                                 console.log("Email Sent");
//                             } else {
//                                 console.log("Email Failed");
//                             }
//                         });
//                         console.log(error);
//                         var obj = {
//                             'status': "0",
//                             'message': "Something Went Wrong"
//                         };
//                         res.json(obj);
//                     }
//                 });
//             } else {
//                 var obj = {
//                     'status': "0",
//                     'message': "Unauthorized Entry: Please Contact the Admin"
//                 };
//                 res.json(obj);
//             }
//         });
//     } else {
//         var obj = {
//             'status': "0",
//             'message': "Unauthorized Entry: Please Contact the Admin"
//         };
//         res.json(obj);
//     }
// });
app.get('/users/verify/:type/:phone', methods.verifyUser);
// //Register a device with a valid token Number
app.post('/user/update/:token', methods.registerDevice);
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
// app.post('/users', methods.registerUser);
app.use(function(req, res) {
    func.emailer('Some on is accessing default', 'Some one is accessing the default route on the API', function(e) {
        if (e) {
            console.log("Email Sent");
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
