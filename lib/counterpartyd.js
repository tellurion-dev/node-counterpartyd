// Copyright © 2014 tipsjcx

var request = require("request");

// Constructor
var username = "";
var password = "";

function counterpartyd(user, pass) {
  username = user;
  password = pass;
}

var transmitt = function(payload, cb) {
  var url = "http://localhost:4000/api/";
  auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

  request.post({
         url: url,
         json: true,
         headers : {
            "Authorization" : auth
         },
         body : JSON.stringify(payload)
      }, function (error, response, body) {   
         if (body.error) cb({err: body.error});   
         if (body.result) cb({result : body.result}); 
     });
}; 

var createUnsignedtx = function(source, destination, asset, quantity, cb) {
  payload = {
     "method": "create_send",
     "params": {'source': source,
             'destination': destination,
             'asset': asset,
             'quantity': quantity},
     "jsonrpc": "2.0",
     "id": 0,
 }

   transmitt(payload, function(result) {
      cb(result);
   });
}

var signtx = function(unsigned_tx, cb) {
  payload = {
     "method": "sign_tx",
     "params": {'unsigned_tx_hex': unsigned_tx},
     "jsonrpc": "2.0",
     "id": 0,
  }

   transmitt(payload, function(result) {
      cb(result);      
   });
}

var broadcasttx = function(signed_tx, cb) {
  payload = {
     "method": "broadcast_tx",
     "params": {'signed_tx_hex': signed_tx},
     "jsonrpc": "2.0",
     "id": 0,
   }

   transmitt(payload, function(result) {
       cb(result);   
   });
}

counterpartyd.prototype.send = function(source, destination, asset, quantity , cb) {
  createUnsignedtx(source, destination, asset, quantity, function(Unsignedtx){
     if (!Unsignedtx.result) {cb(Unsignedtx.err.data.message); return;} else
     {
       signtx(Unsignedtx.result, function(signtx) {
         if (signtx.result) {
            broadcasttx(signtx.result, function(res) {
               cb("OK");
            });
         }
       });
     }
  });
}; 

counterpartyd.prototype.getBalance = function(addr , cb) {
   var payload = {
      "method": "get_balances",
      "params": {"filters": {'field': 'address', 'op': '==', 'value': addr}},
      "jsonrpc": "2.0",
      "id": 0,
   }

   transmitt(payload, function(result) {
       cb(result);    
     });
}; 


// export the class
module.exports = counterpartyd;
