'use strict';

// Application
var net = require('net');
var netServer = net.createServer(newSocket);
var sockets = [];
var groups = [ 'all' ];

var fs = require('fs');
var path = require('path');
var config = require('./config/config.js');

var log4js = require('log4js');
log4js.configure('./config/log4js.json', { /*reloadSecs: 300 //период перечитывания конфигурации*/ });

var express = require('express');
var app = express();
//app.use("/public", express.static(path.join(__dirname, './public')));
app.use(express.static(process.cwd() + '/public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
})); // support encoded bodies

var serveIndex = require('serve-index');
app.use('/log', serveIndex('public/log', {
  'icons': true
}));

var pug = require('pug');
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

function newSocket(socket) {
  
  // We have a connection - a socket object is assigned to the connection automatically
  console.log('Connected client: ' + socket.remoteAddress.slice(7) + ':' + socket.remotePort);
  sockets.push(socket);
  socket.write('Вы подключились к системе сообщений\n');

  socket.on('data', function(data) {
    var socketData = '';
    console.log('Message from client ' + socket.remoteAddress.slice(7) + ':' + socket.remotePort + ' - ' + data.toString());

    try {
      socketData = JSON.parse(data);
      //console.log('Client say ' + socketData.myIP + ':' + socketData.myPort + ' - ' + socketData.myMsg);

      //console.log(socketData.myVersion);
      if (socketData.myVersion) {
        socket.remoteClientVersion = socketData.myVersion;
        //console.log(socket.remoteClientVersion);
      }

      //console.log(socketData.myMsg);

      //console.log(socketData.myIP)
      if (socketData.myIP) {
        socket.remoteClientIP = socketData.myIP;
        //console.log(socket.remoteClientIP);
      }

      //console.log(socketData.myPort);
      if (socketData.myPort) {
        socket.remoteClientPort = socketData.myPort;
        //console.log(socket.remoteClientPort);
      }

      //console.log(socketData.myGroup);
      if (socketData.myGroup) {
        socket.remoteClientGroup = socketData.myGroup;
        //console.log(socket.remoteClientGroup);

        var i = groups.indexOf(socketData.myGroup);
        if (i === -1) {
          groups.push(socketData.myGroup);
        }
        //console.log(groups);
      }

    } catch (e) {
      console.log("error parse JSON " + e);
    }

  });

  socket.on('end', function() {
    //console.log('Client ' + socket.remoteAddress + ':' + socket.remotePort + ' - end connection');
    var i = sockets.indexOf(socket);
    if (i !== -1) {
      sockets.splice(i, 1);
      console.log('Client ' + socket.remoteClientIP + ':' + socket.remoteClientPort + ' - end connection');
    }
  });

  socket.on('error', function(e) {
    console.log("error " + e);

    var i = sockets.indexOf(socket);
    //console.log('socket.server.domain - ' + socket.server.domain);
    if (i !== -1) {
      sockets.splice(i, 1);
      console.log('Client ' + socket.remoteClientIP + ':' + socket.remoteClientPort + ' - connection error');
    }

  });

  socket.on('close', function() {

    var i = sockets.indexOf(socket);
    if (i !== -1) {
      sockets.splice(i, 1);
      console.log('Client ' + socket.remoteClientIP + ':' + socket.remoteClientPort + ' - close connection');
    }

  });

}

// middleware
app.use(function timeLog(req, res, next) {
  //console.log('req.ip - ' + req.ip);
  //console.log('config.allowedIp - ' + config.allowedIp);
  var i = config.allowedIp.indexOf(req.ip);
  if (i < 0) {
    res.statusCode = 403;
    res.send('<div style="text-align: center">Вам не разрешено передавать сообщения</div>');
    console.log('Попытка передачи сообщения с IP адреса: ' + req.ip);
  } else {
    next();
  }

});

app.post('/message', function(req, res) {
  //console.log('Message for server from IP: ' + req.ip + ' - ' + req.body.message + ', ' + req.body.ipAdres);
  console.log('Message for "' + req.body.groupOrIpAdres + '" from IP: ' + req.ip + ' - ' + req.body.message);

  for (var i = 0; i < sockets.length; i++) {
    //console.log('sockets[' + i + '].remoteAddress - ' + sockets[i].remoteAddress);
    if (req.body.groupOrIpAdres === 'all' ||
        req.body.groupOrIpAdres === sockets[i].remoteClientGroup ||
        req.body.groupOrIpAdres === sockets[i].remoteAddress) {
      sockets[i].write(req.body.message + "\n");
    }
  }
  res.statusCode = 201;
  res.send('<div style="text-align: center">Сообщение отправлено! <br><a href="/">Отправить еще.</a></div>');
});

app.get('/', function(req, res) {
  res.render('index', {
    sockets: sockets,
    groups: groups
  });
});

app.get('/log', function(req, res) {
  return fs.readdir('./public/log/', function(err, files) {
    if (!err) {
      //console.log(files);
      return res.send(files);
    } else {
      res.statusCode = 500;
      console.log('Internal error(%d): %s', res.statusCode, err.message);
      return res.send({
        error: 'Server error'
      });
    }
  });
});

app.get('*', function(req, res) {
  return res.redirect('/');
});

netServer.listen(config.messagePort, function() {
  var host = netServer.address().address;
  var port = netServer.address().port;
  console.log('Сервер принимает сообщения по адресу http://%s:%s', host, port);
});

var server = app.listen(config.webPort, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('WEB-интерфейс приложения доступен по адресу http://%s:%s', host, port);
});