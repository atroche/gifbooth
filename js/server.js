// Generated by CoffeeScript 1.3.3
(function() {
  var allowCrossDomain, app, exec, express, fs, gifs, http, io, models, most_recent_gifs, server, sys, uuid, _;

  allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', ['localhost', '192.168.1.15', 'gifbooth.likelikelikelike.com']);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return next();
  };

  express = require('express');

  app = express();

  app.use(express.bodyParser());

  app.use(express["static"](__dirname + '/../'));

  app.use(allowCrossDomain);

  http = require('http');

  server = http.createServer(app);

  server.listen(8080);

  io = require('socket.io').listen(server);

  fs = require('fs');

  uuid = require('node-uuid');

  sys = require('sys');

  exec = require('child_process').exec;

  _ = require('underscore');

  models = require('./models');

  most_recent_gifs = function() {
    return _.sortBy(fs.readdirSync('gifs/'), function(filename) {
      return fs.statSync('gifs/' + filename).mtime;
    });
  };

  app.get('/recent', function(req, res) {
    var most_recent;
    most_recent = _.chain(most_recent_gifs()).reverse().first(5).value();
    return res.json(most_recent);
  });

  app.post('/email', function(req, res) {
    return fs.open('emails', 'a', function(err, fd) {
      fs.write(fd, "" + req.body.email + " " + req.body.id + "\n");
      return res.json(req.body);
    });
  });

  gifs = [];

  io.sockets.on('connection', function(socket) {
    socket.on('newGif', function(data) {
      var gif;
      gif = new models.GIF(data.numShots, socket, data.FPS);
      gifs.push(gif);
      return socket.emit('newGifReady', {
        gifId: gif.id
      });
    });
    return socket.on('newSnapshot', function(snapData) {
      var gif;
      gif = _(gifs).findWhere({
        id: snapData.gifId
      });
      if (gif) {
        return gif.addSnapshot(snapData);
      } else {
        return socket.emit('error');
      }
    });
  });

}).call(this);
