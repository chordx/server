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

var serverKey = 'AIzaSyDdSCwfD85uuuBNc3yIGsMCxrJI3G72sgQ';
var fcm = new FCM(serverKey);
Array.prototype.keySort = function(key, desc){
  this.sort(function(a, b) {
    var result = desc ? (a[key] > b[key]) : (a[key] < b[key]);
    return result ? 1 : -1;
  });
  return this;
}
var ifunctions={

getAllDrivers:function(callback){
 	return db.query("SELECT vehicle.driver_id, vehicle.last_lat, vehicle.last_lng FROM tbl_vehicle vehicle left OUTER join tbl_shedule shed on shed.driver_id=vehicle.driver_id left outer join tbl_ride ride on ride.driver_id=shed.driver_id  WHERE vehicle.status=1",callback);
},
setStatusAccept:function(todo, status, callback){
	return db.query("UPDATE `expo_db`.`tb_todo` SET `status`=? WHERE `todo_id`=?", [status, todo], callback);
},
getDriversById:function(id,callback){ 
	return db.query("SELECT u.fName, u.lName, u.phone, u.email, u.pro_pic, v.model, CAST(v.passenger_no as CHAR(50)) as passenger_no, v.colour, v.plate_no FROM `tbl_users` u inner join tbl_vehicle v on u.user_id=v.driver_id WHERE u.`user_id`=?",[id],callback);
},
getOwnerById:function(id,callback){ 
	return db.query("SELECT u.fName, u.lName, u.phone, u.email, u.pro_pic FROM `tbl_users` u WHERE u.`user_id`=?",[id],callback);
},
getDriversByPhone:function(phone, driver, owner, callback){ 
	return db.query("SELECT * FROM `tbl_users` WHERE (`phone`=? AND `isDriver`=?) AND `isOwner`=?",[phone, driver, owner],callback);
},
addUsers:function(driver,callback){
 return db.query("INSERT INTO `tbl_users` (`fName`,`lName`,`email`,`username`,`phone`) VALUES (?,?,?,?,?)",[driver.fName, driver.lName, driver.email, driver.username, driver.phone], callback);
},
deleteDrivers:function(id,callback){
 return db.query("delete from `tbl_users` where `user_id`=?",[id],callback);
},
updateDrivers:function(id,Task,callback){
 return db.query("update task set Title=?,Status=? where Id=?",[Task.Title,Task.Status,id],callback);
},
checkTokenbyUser:function(user_id, callback){
 return db.query("SELECT * FROM `tbl_tokens` WHERE (`user_id`=?) AND isAvailable=1",[user_id], callback);
},
checkTokenbyToken:function(token, callback){
 return db.query("SELECT * FROM `tbl_tokens` WHERE (`tokens`=?) AND isAvailable=1",[token], callback);
},
createToken:function(user_id, token, callback){
 return db.query("INSERT INTO `tbl_tokens` (`user_id`,`tokens`) VALUES (?,?)",[user_id, token], callback);
},
expireToken:function(token,callback){
 return db.query("update `tbl_tokens` set isAvailable=0,updatedDate=NOW() WHERE tokens=? AND isAvailable=1",[token],callback);
},
registerDevice:function(user_id, device, api_key, callback){
 return db.query("INSERT INTO `tbl_devices` (`user_id`, `device_unique`, `api_key`, `isAndroid`, `isIOS`, `push_ref`) VALUES (?,?,?,?,?,?)",[user_id, device.device_unique, api_key, device.isAndroid, device.isIOS, device.push_ref], callback);
},
checkDeviceAlreadyRegistered:function(device_id, callback){
 return db.query("SELECT * FROM `tbl_devices` WHERE device_unique=?",[device_id], callback);
},
registerVehicle:function(vehicle, callback){
	return db.query("INSERT INTO `tbl_vehicle`(`model`, `colour`, `passenger_no`, `plate_no`, `driver_id`, `owner_id`, `last_lat`, `last_lng`) VALUES (?,?,?,?,?,?,?,?)",[vehicle.model, vehicle.colour, vehicle.passenger_no, vehicle.plate_no, vehicle.driver_id,vehicle.owner_id,vehicle.last_lat, vehicle.last_lng], callback);
},
checkOwnerRegisteredVehicles:function(driver_id, owner_id, callback){
	return db.query("SELECT count(*) as active FROM `tbl_users` WHERE `user_id`=? UNION SELECT count(*) as active FROM `tbl_users` WHERE `user_id`=?",[driver_id,owner_id], callback);
},
searchVehiclesbyPlate:function(plate_no, callback){
	return db.query("SELECT * FROM `tbl_vehicle` WHERE `plate_no`=?", plate_no, callback);
},
updateLATLNGVehicle:function(plate_no, vehicle, callback){
 return db.query("UPDATE `tbl_vehicle` SET `last_lat`=?,`last_lng`=?,`updated_date`=NOW() WHERE plate_no=?",[vehicle.lat, vehicle.lng, plate_no],callback);
},
getDrivers:function(callback){
 	return db.query("SELECT CAST(vehicle.vehicle_id as CHAR(50)) as vehicle,plate_no, vehicle_id, user.pro_pic, user.fname, user.lname, user.phone, vehicle.passenger_no, vehicle.model, vehicle.colour, vehicle.driver_id, vehicle.last_lat AS lat, vehicle.last_lng AS lng FROM tbl_vehicle vehicle left join tbl_shedule shed on shed.driver_id=vehicle.driver_id left join tbl_ride ride on ride.driver_id=shed.driver_id inner join tbl_users user on user.user_id=vehicle.driver_id WHERE vehicle.status=1 AND (NOW() NOT BETWEEN shed.from AND shed.to OR (shed.from is null AND shed.to is null)) AND (ride.ride_status is null OR ride.ride_status != 1) group by vehicle.vehicle_id",callback);
},
getVehiclesbyID:function(vehicle, callback){
 	return db.query("SELECT `last_lat`, `last_lng` FROM `tbl_vehicle` WHERE `vehicle_id`=?",vehicle,callback);
},
getSheduleofID:function(driver_id, callback){
	return db.query("SELECT *,v.* FROM `tbl_shedule` shed inner join tbl_vehicle v on v.shed.driver_id=v.driver_id WHERE `driver_id`=? AND WHERE NOW() > shed.to", driver_id, callback);
},
getUserbyAPIKEY:function(key, callback){
	return db.query("SELECT d.idDevices, d.user_id, u.`fName`, v.vehicle_id, u.`lName`, u.phone, v.plate_no, v.model, u.pro_pic FROM tbl_devices d inner join tbl_users u on u.user_id=d.user_id left outer join tbl_vehicle v on v.driver_id=u.user_id WHERE d.api_key=?", key, callback);
	//return db.query("SELECT d.idDevices, d.user_id, u.`fName`, u.`lName`, u.phone FROM tbl_devices d inner join tbl_users u on u.user_id=d.user_id WHERE d.api_key=?", key, callback);
},
createInstantTrip:function(passenger_id, ride, callback){
	console.log(ride.driver_id + " " + passenger_id+ " " + ride.lat + " " + ride.lng+" ");
	return db.query("INSERT INTO `expo_db`.`tbl_ride` (`driver_id`,`passenger_id`,`passenger_origin_lat`,`passenger_origin_lng`, `passenger_end_lat`, `passenger_end_lng`, `place_id`, `place_name`, `place_address`, `dest_id`, `dest_name`, `dest_address`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",[ride.driver_id,passenger_id,ride.lat,ride.lng, ride.endlat, ride.endlng, ride.place_id, ride.place_name, ride.place_address, ride.dest_id, ride.dest_name, ride.dest_address], callback);
},
getDriverDeviceFromID:function(driver_id, callback){
	return db.query("SELECT `push_ref` FROM `tbl_devices` WHERE `user_id`=? ORDER BY `updated_date` DESC LIMIT 1", driver_id, callback);
},
getDriverPushRefs:function(todo_id, callback){
	return db.query("SELECT t.task, d.push_ref FROM expo_db.tb_todo t inner join tbl_shedule shed on shed.shedule_id=t.shedule_id inner join tbl_devices d on d.user_id=shed.passenger_id WHERE todo_id=? order by d.updated_date DESC LIMIT 1", todo_id, callback);
},
getOwnerDeviceOnCancel:function(ride_id, callback){
	return db.query("SELECT d.`push_ref` FROM `tbl_devices` d inner join tbl_ride r on d.user_id=r.driver_id WHERE r.ride_id=? ORDER BY d.`updated_date` DESC LIMIT 1", ride_id, callback);
},
getOwnerDeviceOnCancelShedule:function(ride_id, callback){
	return db.query("SELECT d.`push_ref` FROM `tbl_devices` d inner join tbl_shedule s on d.user_id=s.driver_id WHERE s.shedule_id=? ORDER BY d.`updated_date` DESC LIMIT 1", ride_id, callback);
},
getRideShedule:function(driver_id, approval, ride_id, callback){
	return db.query("SELECT d.push_ref, r.passenger_origin_lat, r.passenger_origin_lng, r.passenger_end_lat, r.passenger_end_lng, v.last_lat, v.last_lng, r.`place_id`, r.`place_name`, r.`place_address`, r.`dest_id`, r.`dest_name`, r.`dest_address`, v.vehicle_id FROM `tbl_ride` r inner join tbl_devices d on r.passenger_id=d.user_id inner join tbl_vehicle v on v.driver_id=r.driver_id WHERE (r.`driver_id`=? && r.driver_approval=?) && (r.ride_status=-1 && r.ride_id=?) ORDER BY d.`updated_date` DESC LIMIT 1;",[driver_id, approval, ride_id], callback);
},
getShedulebyID:function(driver_id, approval, ride_id, callback){
	return db.query("SELECT d.push_ref, s.passenger_start_lat, s.passenger_start_lng, s.passenger_end_lat, s.passenger_end_lng, s.`place_id`, s.`place_name`, s.`place_address`, s.`dest_id`, s.`dest_name`, s.`dest_address`, v.last_lat, v.last_lng, v.vehicle_id FROM `tbl_shedule` s inner join tbl_devices d on s.passenger_id=d.user_id inner join tbl_vehicle v on v.driver_id=s.driver_id WHERE (s.`driver_id`=? && s.driver_approval=?) && (s.status=0 && s.shedule_id=?) ORDER BY d.`updated_date` DESC LIMIT 1;",[driver_id, approval, ride_id], callback);
},
updateRide:function(driver_id,ride_id,status,approval, callback){
	return db.query("UPDATE `tbl_ride` SET driver_approval=? WHERE (`driver_id`=? && driver_approval=?) && (ride_status=-1 && ride_id=?)", [status, driver_id, approval, ride_id], callback);
},
updateShedule:function(driver_id,shedule_id,status,approval, callback){
	if(status == -8) status = -6;
	console.log(driver_id + " "+ shedule_id + " " + status + " " + approval);
	if(approval != -1)
		return db.query("UPDATE `tbl_shedule` SET driver_approval=? WHERE (`driver_id`=? && driver_approval=?) && (status=0 && shedule_id=?) && NOW() >= date_sub(`from`, INTERVAL 3 hour)", [status, driver_id, approval, shedule_id], callback);
	else
		return db.query("UPDATE `tbl_shedule` SET driver_approval=? WHERE (`driver_id`=? && driver_approval=?) && (status=0 && shedule_id=?)", [status, driver_id, approval, shedule_id], callback);

},
stateChange:function(api, state, callback){
	return db.query("UPDATE `expo_db`.`tbl_vehicle` v inner join tbl_devices d on d.user_id=v.driver_id  SET v.`status`=? WHERE d.api_key=?",[state, api], callback);
},
updateFirebase:function(firebase, device_unique, callback){
	return db.query("UPDATE `tbl_devices` SET  `push_ref`=?, `updated_date`=NOW() WHERE `device_unique`=?",[firebase, device_unique], callback);
},
getState:function(user, callback){
	return db.query("select CAST(v.plate_no as CHAR(50)) as plate_no, CAST(v.last_lat as CHAR(50)) as last_lat, CAST(v.last_lng as CHAR(50)) as last_lng, CAST(u.user_id as CHAR(50)) as user_id, CAST(u.fName as CHAR(50)) as fName, CAST(u.lName as CHAR(50)) as lName, CAST(u.phone as CHAR(50)) as phone, CAST(u.pro_pic as CHAR(50)) as pro_pic, IF(r.driver_approval=1, '3', '7') AS mode, CAST(r.passenger_end_lat as CHAR(50)) as passenger_end_lat, CAST(r.passenger_end_lng as CHAR(50)) as passenger_end_lng, CAST(r.passenger_origin_lat as CHAR(50)) as passenger_origin_lat, CAST(r.passenger_origin_lng as CHAR(50)) as passenger_origin_lng, CAST(r.driver_id as CHAR(50)) as driver_id, CAST(v.vehicle_id as CHAR(50)) as vehicle_id, v.model, v.colour, CAST(r.ride_id as CHAR(50)) as ride_id from tbl_ride r inner join tbl_users u on u.user_id=r.driver_id inner join tbl_vehicle v on v.driver_id=u.user_id WHERE r.passenger_id=? AND (r.driver_approval=1 OR r.driver_approval=-4) ORDER BY r.task_updated DESC LIMIT 1;", user, callback);
},
getTripState:function(user, callback){
	return db.query("select CAST(v.plate_no as CHAR(50)) as plate_no, CAST(v.last_lat as CHAR(50)) as last_lat, CAST(v.last_lng as CHAR(50)) as last_lng, CAST(u.user_id as CHAR(50)) as user_id, CAST(u.fName as CHAR(50)) as fName, CAST(u.lName as CHAR(50)) as lName, CAST(u.phone as CHAR(50)) as phone, CAST(u.pro_pic as CHAR(50)) as pro_pic, IF(r.driver_approval=1, '3', '7') AS mode, CAST(r.passenger_end_lat as CHAR(50)) as passenger_end_lat, CAST(r.passenger_end_lng as CHAR(50)) as passenger_end_lng, CAST(r.passenger_origin_lat as CHAR(50)) as passenger_origin_lat, CAST(r.passenger_origin_lng as CHAR(50)) as passenger_origin_lng, CAST(r.driver_id as CHAR(50)) as driver_id, CAST(v.vehicle_id as CHAR(50)) as vehicle_id, v.model, v.colour, r.`place_id`, r.`place_name`, r.`place_address`, r.`dest_id`, r.`dest_name`, r.`dest_address`, CAST(r.ride_id as CHAR(50)) as ride_id from tbl_ride r inner join tbl_users u on u.user_id=r.driver_id inner join tbl_vehicle v on v.driver_id=u.user_id WHERE r.passenger_id=? AND (r.driver_approval=1 OR r.driver_approval=-4) ORDER BY r.task_updated DESC LIMIT 1;", user, callback);
},
getSheduleState:function(user, callback){
	return db.query("select CAST(v.plate_no as CHAR(50)) as plate_no, r.`place_id`, r.`place_name`, r.`place_address`, r.`dest_id`, r.`dest_name`, r.`dest_address`, CAST(v.last_lat as CHAR(50)) as last_lat, CAST(v.last_lng as CHAR(50)) as last_lng, CAST(u.user_id as CHAR(50)) as user_id, CAST(u.fName as CHAR(50)) as fName, CAST(u.lName as CHAR(50)) as lName, CAST(u.phone as CHAR(50)) as phone, CAST(u.pro_pic as CHAR(50)) as pro_pic, IF(r.driver_approval=-6, '3', '7') AS mode, CAST(r.passenger_end_lat as CHAR(50)) as passenger_end_lat, CAST(r.passenger_end_lng as CHAR(50)) as passenger_end_lng, CAST(r.passenger_start_lat as CHAR(50)) as passenger_origin_lat, CAST(r.passenger_start_lng as CHAR(50)) as passenger_origin_lng, CAST(r.driver_id as CHAR(50)) as driver_id, CAST(v.vehicle_id as CHAR(50)) as vehicle_id, v.model, v.colour, CAST(r.shedule_id as CHAR(50)) as ride_id from tbl_shedule r inner join tbl_users u on u.user_id=r.driver_id inner join tbl_vehicle v on v.driver_id=u.user_id WHERE r.passenger_id=? AND (r.driver_approval=-6 OR r.driver_approval=-4) && (NOW() BETWEEN date_sub(r.`from`, INTERVAL 3 hour) AND date_add(r.`to`, INTERVAL 3 hour)) ORDER BY r.`from` DESC LIMIT 1", user, callback);
},
//`passenger_start_lat`,`passenger_start_lng`,
addShedule:function(user, shedule, callback){
	return db.query("INSERT INTO `expo_db`.`tbl_shedule`(`passenger_id`,`driver_id`,`isTodo`,`todo`,`from`,`to`, `place_id`, `place_name`, `place_address`, `dest_id`, `dest_name`, `dest_address`, `date`,`status`,`driver_approval`,`passenger_start_lat`,`passenger_start_lng`, `passenger_end_lat`, `passenger_end_lng`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [user, shedule.driver_id, shedule.isTodo, shedule.todo, shedule.from, shedule.to, shedule.place_id, shedule.place_name, shedule.place_address, shedule.dest_id, shedule.dest_name, shedule.dest_address, shedule.date, 0, -1, shedule.start_lat, shedule.start_lng, shedule.end_lat, shedule.end_lng], callback);
},
addTODO:function(shedule, todo, callback){
	return db.query("INSERT INTO `expo_db`.`tb_todo` (`shedule_id`,`task`) VALUES (?,?)", [shedule, todo], callback);
},
getStateDriver:function(user_id, callback){
	return db.query("select CAST(u.user_id as CHAR(50)) as user_id, r.`place_id`, r.`place_name`, r.`place_address`, r.`dest_id`, r.`dest_name`, r.`dest_address`, CAST(u.fName as CHAR(50)) as fName, CAST(u.lName as CHAR(50)) as lName, CAST(u.phone as CHAR(50)) as phone, CAST(u.pro_pic as CHAR(50)) as pro_pic, (CASE WHEN r.driver_approval='0' THEN '21' WHEN r.driver_approval='1' THEN '3' ELSE '7' END ) AS mode, CAST(r.passenger_end_lat as CHAR(50)) as passenger_end_lat, CAST(r.passenger_end_lng as CHAR(50)) as passenger_end_lng, CAST(r.passenger_origin_lat as CHAR(50)) as passenger_origin_lat, CAST(r.passenger_origin_lng as CHAR(50)) as passenger_origin_lng,CAST(r.driver_id as CHAR(50)) as driver_id, CAST(r.ride_id as CHAR(50)) as ride_id from tbl_ride r inner join tbl_users u on u.user_id=r.passenger_id WHERE r.driver_id=? AND (r.driver_approval=1 OR r.driver_approval=-4 OR r.driver_approval=0) ORDER BY r.task_updated DESC LIMIT 1",user_id, callback);
},
getStateSheduledDriver:function(user_id, callback){
	return db.query("SELECT CAST(u.user_id AS CHAR (50)) AS user_id, s.`place_id`, s.`place_name`, s.`place_address`,CAST(u.fName AS CHAR (50)) AS fName, CAST(u.lName AS CHAR (50)) AS lName, CAST(u.phone AS CHAR (50)) AS phone, CAST(u.pro_pic AS CHAR (50)) AS pro_pic, IF(s.driver_approval=-6, '23', '27') AS mode, CAST(s.passenger_end_lat AS CHAR (50)) AS passenger_end_lat, CAST(s.passenger_end_lng AS CHAR (50)) AS passenger_end_lng, CAST(s.passenger_start_lat AS CHAR (50)) AS passenger_origin_lat, CAST(s.passenger_start_lng AS CHAR (50)) AS passenger_origin_lng, CAST(s.driver_id AS CHAR (50)) AS driver_id, CAST(s.shedule_id AS CHAR (50)) AS ride_id FROM tbl_shedule s INNER JOIN tbl_users u ON u.user_id = s.passenger_id WHERE s.driver_id =? AND (s.driver_approval=-6 OR s.driver_approval = -4) && (NOW() BETWEEN date_sub(s.`from`, INTERVAL 3 hour) AND date_add(s.`to`, INTERVAL 3 hour)) ORDER BY s.`from` DESC LIMIT 1",user_id, callback);
},
cancelRide:function(user_id, ride_id, callback){
	return db.query("update tbl_ride set driver_approval=-5,ride_status=0 WHERE (ride_id=? AND passenger_id=?) AND (driver_approval=0 OR driver_approval=1 OR driver_approval=-4)", [ride_id, user_id], callback);
},
cancelShedule:function(user_id, shedule_id, callback){
	console.log(user_id +" " +shedule_id);
	return db.query("update tbl_shedule set driver_approval=-5,status=0 WHERE (shedule_id=? AND driver_id=?) AND (driver_approval=-6)", [shedule_id, user_id], callback);
},
getCancelID:function(ride_id, callback){
	return db.query('select driver_approval from tbl_ride Where ride_id=?', ride_id, callback);
},
getCancelIDShedule:function(ride_id, callback){
	return db.query('select driver_id,driver_approval from tbl_shedule Where shedule_id=?', ride_id, callback);
},
getSheduleDrivers:function(from,to,callback){
		//return db.query("select CAST(u.user_id as CHAR(50)) as driver_id, v.model,v.colour,u.phone,u.pro_pic,u.fName,u.lName,v.plate_no from tbl_users u inner join tbl_vehicle v on v.driver_id=u.user_id left join tbl_shedule s on s.driver_id=u.user_id left join tbl_ride r on r.driver_id=u.user_id where u.isDriver=1 && (((? NOT BETWEEN s.from AND s.to) && (? NOT BETWEEN s.from AND s.to)) OR (s.from is null AND s.to is null)) && (s.driver_approval is null OR s.driver_approval!=-1) group by u.user_id", [from, to], callback);
	return db.query("SELECT * From ((SELECT CAST(u.user_id AS CHAR (50)) AS driver_id,v.model,v.colour,u.phone,u.pro_pic,u.fName,u.lName,v.plate_no FROM tbl_users u INNER JOIN tbl_vehicle v ON v.driver_id = u.user_id INNER JOIN tbl_shedule s ON s.driver_id = u.user_id LEFT JOIN tbl_ride r ON r.driver_id = u.user_id WHERE u.isDriver = 1 && (? BETWEEN s.from AND s.to) OR (? BETWEEN s.from AND s.to) GROUP BY u.user_id) UNION ALL (SELECT CAST(u.user_id AS CHAR (50)) AS driver_id, v.model, v.colour, u.phone, u.pro_pic, u.fName, u.lName, v.plate_no FROM tbl_users u INNER JOIN tbl_vehicle v ON v.driver_id = u.user_id LEFT JOIN tbl_shedule s ON s.driver_id = u.user_id LEFT JOIN tbl_ride r ON r.driver_id = u.user_id GROUP BY u.user_id)) As tbl GROUP BY tbl.driver_id HAVING COUNT(*)=1", [from, to], callback);
},
getMyShedule:function(driver_id, callback){
	return db.query("select u.fName, u.lName, u.pro_pic, u.phone, s.passenger_start_lat, s.passenger_start_lng, s.passenger_end_lat, s.passenger_end_lng, s.isTodo, IF(t.todo_id is null, '-1', t.todo_id) as todo_id from tbl_shedule s inner join tbl_users u on u.user_id=s.passenger_id left join tb_todo t on t.shedule_id=s.shedule_id WHERE s.driver_id=? && s.driver_approval=1 && (s.to > '2017-03-06 18:06:00') group by t.shedule_id;", driver_id, callback);
},
getMyShedulebyDate:function(driver_id, date1, date2, callback){
	return db.query("select u.fName, s.shedule_id, s.from, s.to, u.lName, u.pro_pic, u.phone, s.passenger_start_lat, s.passenger_start_lng, s.passenger_end_lat, s.passenger_end_lng, s.isTodo, IF(t.todo_id is null, '-1', t.todo_id) as todo_id from tbl_shedule s inner join tbl_users u on u.user_id=s.passenger_id left join tb_todo t on t.shedule_id=s.shedule_id WHERE s.driver_id=? && s.driver_approval=1 && (s.from BETWEEN ? AND ?) group by t.shedule_id;", [driver_id, date1, date2], callback);
},
getPrevShedule:function(driver_id, time, callback){
	return db.query("select s.from, s.to, u.fName, u.lName, u.pro_pic, u.phone, s.passenger_start_lat, s.passenger_start_lng, s.passenger_end_lat, s.passenger_end_lng, s.isTodo, IF(t.todo_id is null, '-1', t.todo_id) as todo_id from tbl_shedule s inner join tbl_users u on u.user_id=s.passenger_id left join tb_todo t on t.shedule_id=s.shedule_id WHERE s.driver_id=? && s.driver_approval=1 && (s.from < ?) ORDER BY s.from DESC LIMIT 1", [driver_id, time], callback);
},
getNextShedule:function(driver_id, time, callback){
	return db.query("select s.from, s.to, u.fName, u.lName, u.pro_pic, u.phone, s.passenger_start_lat, s.passenger_start_lng, s.passenger_end_lat, s.passenger_end_lng, s.isTodo, IF(t.todo_id is null, '-1', t.todo_id) as todo_id from tbl_shedule s inner join tbl_users u on u.user_id=s.passenger_id left join tb_todo t on t.shedule_id=s.shedule_id WHERE s.driver_id=? && s.driver_approval=1 && (s.to > ?) ORDER BY s.from ASC LIMIT 1", [driver_id, time], callback);
},
getShedulebyDay:function(driver_id, date, callback){
	return db.query("select u.fName, u.lName, u.pro_pic, u.phone, s.passenger_start_lat, s.passenger_start_lng, s.passenger_end_lat, s.passenger_end_lng, s.isTodo, IF(t.todo_id is null, '-1', t.todo_id) as todo_id from tbl_shedule s inner join tbl_users u on u.user_id=s.passenger_id left join tb_todo t on t.shedule_id=s.shedule_id WHERE s.driver_id=? && s.driver_approval=1 && (s.to > '?') ORDER BY s.from ASC LIMIT 1", [driver_id, time], callback);
},
getTODO:function(shedule_id, callback){
	return db.query("SELECT * FROM expo_db.tb_todo WHERE shedule_id=?", shedule_id, callback);
},
uploadProPic:function(user_id, image, callback){
	return db.query("UPDATE `expo_db`.`tbl_users` SET `pro_pic`=? WHERE `user_id`=?", [image, user_id], callback);
},
getSheduleFunction:function(shedule_id, callback){
	return db.query("select DISTINCT s.*, u.fName, u.lName, u.phone, u.pro_pic, (SELECT COUNT(*) FROM tb_todo  WHERE shedule_id=1) as todoCount from tbl_shedule s left join tb_todo t on t.shedule_id=s.shedule_id inner join tbl_users u on s.passenger_id=u.user_id WHERE s.shedule_id=?", shedule_id, callback);
},
getHistory:function(user_id, type, usertype, page, per_page, callback){
	//Previouse Version
	// var count = 5;
	// var start = 5 * (page - 1);
	var up = false;
	if(type == "upcoming") 
		up = true;
	var post_count_per_page = per_page;
	var start_page = 1;
	var end_page = (page * post_count_per_page);

	//var end = 5 * page;
	var query = "SELECT 0 as sheduled, u.fname, u.lname, u.pro_pic, r.place_id, r.place_name, r.place_address, r.dest_id, r.dest_name, r.dest_address,";
	if(usertype == 'passenger'){
		query += "v.plate_no, v.colour, r.task_created, r.passenger_origin_lat, r.passenger_origin_lng, r.passenger_end_lat, r.passenger_end_lng, ";
		query += "IF(r.driver_approval=-5, 0, 1) as ride_status FROM expo_db.tbl_ride r inner join tbl_users u on u.user_id=r.driver_id inner join tbl_vehicle v on v.driver_id=u.user_id ";
		if(!up)
			query += "WHERE (driver_approval=-5 OR driver_approval=-3) AND ";
		else
			query += "WHERE (driver_approval=1) AND ";
		query += "r.passenger_id=" + user_id;
	}else{
		query += "r.task_created, r.passenger_origin_lat, r.passenger_origin_lng,  r.passenger_end_lat, r.passenger_end_lng, ";
		query += "IF(r.driver_approval=-3, 1, 0) as ride_status FROM expo_db.tbl_ride r inner join tbl_users u on u.user_id=r.passenger_id ";
		if(!up)
			query += "WHERE (driver_approval=-5 OR driver_approval=-3 OR driver_approval=-2) AND ";
		else
			query += "WHERE (driver_approval=1) AND ";
		query += "r.driver_id=" + user_id;
	}
	query += " ORDER BY task_created DESC "
	// query += "LIMIT " + start_page + "," + end_page + ";"; 
	console.log(query);
	return db.query(query, user_id, callback);
},
getHistorySheduled:function(user_id, type, usertype, page, per_page, callback){
	var up = false;
	if(type == "upcoming") 
		up = true;

	var post_count_per_page = per_page;
	var start_page = 1;
	var end_page = (page * post_count_per_page);

	var query = "SELECT 1 as sheduled, u.fname, u.lname, u.pro_pic, TRUNCATE(s.passenger_start_lat, 6) as passenger_origin_lat, TRUNCATE(s.passenger_start_lng, 6) as passenger_origin_lng, TRUNCATE(s.passenger_end_lat, 6) as passenger_end_lat, TRUNCATE(s.passenger_end_lng, 6) as passenger_end_lng, s.from as task_created, IF(s.driver_approval = -5, 0, 1) AS ride_status, s.place_id, s.place_name, s.place_address, s.dest_id, s.dest_name, s.dest_address";
	if(usertype == 'passenger'){
		query += ", v.plate_no, v.colour FROM tbl_shedule s INNER JOIN tbl_users u ON u.user_id = s.driver_id INNER JOIN tbl_vehicle v ON v.driver_id = u.user_id WHERE s.passenger_id = ";
		query += user_id + " && ";
		if(!up)
			query += "(s.driver_approval=-3 OR s.driver_approval=-5) ";
		else
			query += "(s.driver_approval=1 && s.from > NOW()) ";
	}else{
		query += " FROM tbl_shedule s INNER JOIN tbl_users u ON u.user_id=s.passenger_id WHERE s.driver_id=";
		query += user_id + " && ";
		if(!up)
			query += "(s.driver_approval=-3 OR s.driver_approval=-5) ";
		else
			query += "(s.driver_approval=1 && s.from > NOW()) ";
	}
	query += "ORDER BY s.`from` DESC";
	// query += " LIMIT " + start_page + "," + end_page + ";"; 
	console.log(query);
	return db.query(query, callback);
},
fixdates_in_history:function(result, callback){
	var length = 0;
	var result_last = result;
	result_last = result_last.keySort('task_created');
	for (var i = 0; i < result.length; i++) {
		result[i]['position'] = i;
 		result[i]['task_created'] = moment(dateutil.parse(String(result[i]['task_created']))).format("dddd, MMMM Do YYYY | h:mm a");
		length++;
	}
	if(length == result.length){
		callback(result);
	}
},
send:function(fcm_id, title_message, body_message, type, data_b, callback){
	// var data_body = null;
	// switch(expression) {
 //    case 1:
 //        data_body = {
	//         'text': data_b->text,
	//         'img': data_b->img_url
	//     }
 //        break;
 //    case 2:
 //        data_body = {
	//         'text': data_b->text,
	//         'img': data_b->img_url
	//     }
 //        break;
 //     case 3:
 //        data_body = {
	//         'text': data_b->text,
	//         'img': data_b->img_url
	//     }
 //        break;
 //     case 4:
 //        data_body = {
	//         'text': data_b->text,
	//         'img': data_b->img_url
	//     }
 //        break;
 //    case 5:
 //        data_body = {
	//         'text': data_b->text,
	//         'img': data_b->img_url
	//     }
 //        break;
 //     case 6:
 //        data_body = {
	//         'text': data_b->text,
	//         'img': data_b->img_url
	//     }
 //        break;
 //    default:
 //        code block
	// }
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