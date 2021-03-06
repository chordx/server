var db=require('./config/connection'); //reference of dbconnection.js
var FCM = require('fcm-push');
var moment = require('moment')
var dateutil = require('dateutil');
var mailer = require("nodemailer");
var connect;
db.getConnection(function(err,connection){
	console.log(err)
	        if (err) {
	          	connect = 'true';
	        }else{
	        	connect = 'g';
	        }
 });

var serverKey = 'AIzaSyB0MSEX5o9YYVyjV-H44ARW2ILhhqwfCFI';
var fcm = new FCM(serverKey);
Array.prototype.keySort = function(key, desc){
  this.sort(function(a, b) {
    var result = desc ? (a[key] > b[key]) : (a[key] < b[key]);
    return result ? 1 : -1;
  });
  return this;
}
var ifunctions={

addUsers:function(driver, api_key,callback){
	console.log(driver);
 return db.query("INSERT INTO `tbl_users` (`fName`,`lName`,`email`,`username`, `api_key`, `phone`) VALUES (?,?,?,?,?,?)",[driver.first, driver.last, driver.email, driver.username, api_key, driver.phone], callback);
},
verifyUser:function(user,callback){ 
	return db.query("SELECT fName, lName, api_key FROM `tbl_users` WHERE username=? && password=?",[user.username, user.password],callback);
},
getChords:function(callback){
	return db.query("SELECT * from tbl_chords", callback);	
},
getUserbyAPIKEY:function(key, callback){
	return db.query("SELECT user_id, `fName`, `lName`, phone, pro_pic FROM tbl_users WHERE api_key=?", key, callback);
},
updateFirebase:function(firebase, device_unique, callback){
	return db.query("UPDATE `tbl_users` SET  `ref_token`=?, `updated_date`=NOW() WHERE `api_key`=?",[firebase, device_unique], callback);
},
send:function(fcm_id, title_message, body_message, type, data_b, callback){
	var message = {
	    to: fcm_id, 
	    collapse_key: 'likuid_data', 
	    data: data_b,
	    notification: {
	        title: title_message,
	        body: body_message
	    }
	};
	
	fcm.send(message, function(err, response){
	    if (err) {
	    	console.log(err);
	        console.log("Something has gone wrong!");
	        callback(0);
	    } else {
	        console.log("Successfully sent with response: ", response);
	        callback(1);
	    }
	});

},
emailer:function(subject_body, text_body, callback){
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////var html = "";
		// Use Smtp Protocol to send Email
		var transporter = mailer.createTransport({
	        service: 'Gmail',
	        auth: {
	            user: 'likuidride@gmail.com', // Your email id
	            pass: 'Ride@2017' // Your password
	        }
	    });

	  var mail = {
	      from: "Likuid Ride <likuidrid@gmail.com>",
	      to: "nemomax74@gmail.com",
	      subject: subject_body,
	      text: text_body
	      //html: "<b>Node.js New world for me</b>"
	  }

	  transporter.sendMail(mail, function(error, response){
	      if(error){
	      		callback(0);
	          //console.log(error);
	      }else{
	      		callback(1);
	          //console.log("Message sent: " + response.message);
	      }
	      transporter.close();
	  });
}
};


 module.exports=ifunctions;