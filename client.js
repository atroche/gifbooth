// Generated by CoffeeScript 1.3.3
(function() {
  var FPS, FizzyText, HEIGHT, LENGTH_IN_SECONDS, WIDTH, msBetweenShots, numShots, onError, onSuccess, setFPS, setLengthInSeconds, snapshots, socket;

  WIDTH = 640;

  HEIGHT = 480;

  LENGTH_IN_SECONDS = 1.5;

  FPS = 10;

  msBetweenShots = function() {
    return 1000 / FPS;
  };

  numShots = function() {
    return LENGTH_IN_SECONDS * FPS;
  };

  snapshots = [];

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  onSuccess = function(localMediaStream) {
    var canvas, ctx, takeShot, takeShots, video;
    video = $("video#camera")[0];
    video.src = window.URL.createObjectURL(localMediaStream);
    canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext("2d");
    takeShot = function() {
      ctx.drawImage(video, 0, 0);
      return snapshots.push(canvas.toDataURL("image/jpeg", .7));
    };
    takeShots = function() {
      var i;
      $('#be-patient').show();
      $('button').attr('disabled', true);
      $('#loading').show();
      snapshots = [];
      i = 0;
      while (i < numShots()) {
        setTimeout(takeShot, i * msBetweenShots());
        i++;
      }
      return setTimeout(sendShots, numShots() * msBetweenShots() + 1000);
    };
    return $("button").on("click", takeShots);
  };

  onError = function(error) {
    return console.log("error: " + error.code);
  };

  navigator.getUserMedia({
    video: true
  }, onSuccess, onError);

  FizzyText = function() {
    this.lengthInSeconds = LENGTH_IN_SECONDS;
    return this.FPS = FPS;
  };

  setLengthInSeconds = function(lengthInSeconds) {
    return LENGTH_IN_SECONDS = lengthInSeconds;
  };

  setFPS = function(fps) {
    return FPS = fps;
  };

  window.onload = function() {
    var gui, text;
    text = new FizzyText();
    gui = new dat.GUI();
    gui.add(text, "lengthInSeconds", .5, 4).step(.5).onChange(setLengthInSeconds);
    return gui.add(text, "FPS", 1, 20).onChange(setFPS);
  };

  socket = io.connect("http://178.79.170.14:8080/");

  socket.on("connect", function() {
    $('button').removeAttr('disabled');
    $('#loading').hide();
    socket.on("imgur", function(data) {
      $("#gif").attr('src', data.url);
      $("#gif-url").attr('href', data.url);
      $("#gif-url").text(data.url);
      $('#be-patient').hide();
      $('button').removeAttr('disabled');
      return $('#loading').hide();
    });
    return window.sendShots = function() {
      var img, index, _i, _len, _results;
      socket.emit('numImages', {
        numImages: snapshots.length
      });
      _results = [];
      for (index = _i = 0, _len = snapshots.length; _i < _len; index = ++_i) {
        img = snapshots[index];
        console.log(img);
        _results.push(socket.emit('image', {
          contents: img,
          imgNum: index
        }));
      }
      return _results;
    };
  });

}).call(this);
