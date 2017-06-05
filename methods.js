var express = require('express')
var fs = require('fs')
var suid = require('rand-token').suid;
var morgan = require('morgan')
var path = require('path')
var pathToRegexp = require('path-to-regexp')
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var rfs = require('rotating-file-stream')
var router = express.Router();
var func = require('./ifunctions');
var bodyParser = require('body-parser');
var jwt    = require('jsonwebtoken');
var methods = {};
this.name = "Tanusha";
this.email = 'tanusha@edge.lk';
exports.verifyUser = function (req, res, next) {
	var isOwner = 0;
	var isDriver = 0;
	var obj = null;
	var phone = "";
	if(req.params.type == 'owner'){
		isOwner = 1;
		continued = true;
		if(String(req.params.phone).indexOf("+94") !== -1)
			phone = req.params.phone;
		else
			phone = "+94777217313";
	}else{
		isDriver = 1;
		continued = true;
		phone = req.params.phone;
	}
	if(continued)
		func.getDriversByPhone(phone, isDriver, isOwner,function(err, rows){
			if(err && rows.length == 0){
				var obj = {
			    	'status': "0",
			    	'message': 'Please contact the SysAdmin ' + this.email
				};
				res.json(obj);
			}else{
				var erro;
				var mode = false;
				var token = suid(16);
				var phone = null;
				if(rows.length){
					user_id = rows[0]['user_id'];
					func.checkTokenbyUser(user_id,function(err, ro){
						if(err){
							var obj = {
						    	'status': "0",
						    	'message': err
							};
							res.json(obj);
						}else{
							console.log(ro.length);
							if(!ro.length){
								func.createToken(user_id, token, function(err, rowsq){
									if(!err && rowsq.affectedRows > 0){
										mode = true;
									}	
									console.log(err);					
								});
							}else{
								token = ro[0]['tokens'];
							}

							var result = {
								'fname' : rows[0]['fName'],
								'lname' : rows[0]['lName'],
								'pro_pic' : rows[0]['pro_pic'],
								'email' : rows[0]['email']
 							};
							var obj = {
								'token': (rows.length) ? token : "0",
						    	'status': (rows.length) ? "1" : "0",
						    	'message': (rows.length) ? result : "Oop's No one here"
							};
							res.json(obj);
						}
					});
				}else{
					var obj = {
						    	'status': "0",
						    	'message': "Oop's No one have that thing!! :P"
					};
					res.json(obj);
				}
				
				
			}
		});
};
exports.registerDevice = function (req, res, next) {
	if(req.body && String(req.body.device_unique).length > 0 && String(req.body.push_ref).length > 0){
		var status = -1;
		var api_key = suid(30);
		func.checkTokenbyToken(req.params.token,function(err, rows){
			if(err){
				status = 0;
				var obj = {
			          'status':  "0",
			          'message': "Token Couldn't be checked! && Check if Regenerated!"
			        };    
			     res.json(obj);
			}else{
				if(rows.length){
					func.checkDeviceAlreadyRegistered(req.body.device_unique, function(err, re){
						if(!err && re.length > 0){
							func.updateFirebase(req.body.push_ref, req.body.device_unique, function(e,r){
								if(!e && r.affectedRows > 0){
									status = 1;
									var obj = {
										'key' : re[0]['api_key'],
								    	'status': (status) ? "1" : "0",
								    	'message': (status) ? 'Already Registered Device' : "Knock! Knock! Who is here?"
									};
									res.json(obj);
								}else{
									var obj = {
									    	'status':  "0",
									    	'message': "Failed to Update Push ref!" + e
										};
									res.json(obj);
								}
							});
							
						}else{
							func.registerDevice(rows[0]['user_id'], req.body, api_key, function(err1, resp){
								if(!err1 && resp.affectedRows > 0){
									func.expireToken(req.params.token, function(err, resp1){
										if(!err && resp1.affectedRows){
											var obj = {
												'key' : api_key,
										    	'status': (status) ? "1" : "0",
										    	'message': (status) ? 'Device Registered Successfully' : "Knock! Knock! Who is here?"
											};
											res.json(obj);
										}
									});
								}else{
									var obj = {
								    	'status':  "0",
								    	'message': "Couldnt Register the Device"
									};
									res.json(obj);
								}
							});
						}
					});
				}else{
					var obj = {
			          'status':  "0",
			          'message': "Unauthorized Entry: Please Contact the Admin"
			        };    
			        res.json(obj);
				}
			}
		});
	}else{
		var obj = {
			          'status':  "0",
			          'message': "Request body not present!"
			        };    
		res.json(obj);
	}
};
exports.banUser = function (req, res, next) {
		func.deleteDrivers(req.params.id,function(err, rows){
			if(err){
				res.json(err);
			}else{
				var obj = {
			    	'status': String(rows.affectedRows),
			    	'message': 'Deleted Successfully'
				};
				res.json(obj);
			}
		});
};
exports.registerUser = function (req, res, next) {
	func.addUsers(req.body, function(err, rows){
		if(err){
			res.json(err)
		}else{
			var obj = {
			    'status': String(rows.affectedRows),
			    'message': 'Insert Successfully'
			};
			res.json(obj);
		}
	});
};
exports.logVehicle = function(req, res, next){
	func.getUserbyAPIKEY(req.query.key, function(err, ro){
      if(!err && ro.length){
        user = ro[0]['user_id'];
        console.log(user);
                console.log(ro[0]['plate_no']);
		if(req.body){
			func.searchVehiclesbyPlate(ro[0]['plate_no'], function(err, rows){
				if(!err && rows.length > 0){
					func.updateLATLNGVehicle(ro[0]['plate_no'], req.body, function(e,r){
						if(!err && rows.length > 0 && r.affectedRows){
							var obj = {
						    	'status': String(1),
						    	'message': 'Location Updated Successfully!'
							};
							res.json(obj);	
						}else{
							var obj = {
						    	'status': String(0),
						    	'message': 'Location Not Updated!'
							};
							res.json(obj);	
						}
					});

				}else{
					var obj = {
						    	'status': String(0),
						    	'message': 'What?? No vehicle on that number!! Please contact the Admin'
							};
					res.json(obj);	
				}
			});
		}else{
			var obj = {
		    	'status': String(0),
		    	'message': 'Request Doesnt contain correct LAT LNG'
			};
			res.json(obj);	
		}
	}else{
		var obj = {
          'status':  "0",
          'message': "Unauthorized Entry: Please Contact the Admin"
        };    
        res.json(obj);
	}
});
};
exports.vehicleRegister = function(req, res, next){
	var status = -1;
	if(req.body){
		func.checkOwnerRegisteredVehicles(req.body.driver_id, req.body.owner_id, function(err, rows){
			if((!err && rows.length == 1) && rows[0]['active'] == 1){
				func.searchVehiclesbyPlate(req.body.plate_no, function(er, row){
					if(!err && row.length < 1){
						func.registerVehicle(req.body, function(e, r){
							if(!e && r.affectedRows > 0){
								status = 1;
								var obj = {
							    	'status': String(1),
							    	'message': 'Vehicle Registered Successfully'
								};
								res.json(obj);
							}
						});
					}else{
						var obj = {
					    	'status': String(0),
					    	'message': 'WOW! Vehicle Already Exists!'
						};
						res.json(obj);
					}
				});
			}else{
				var obj = {
			    	'status': String(0),
			    	'message': 'Invalid Owner/Driver'
				};
				res.json(obj);
			}
		});
	}
};

exports.data = methods;