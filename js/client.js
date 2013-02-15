// Generated by CoffeeScript 1.3.3
(function() {
  var FPS, HEIGHT, LENGTH_IN_SECONDS, WIDTH, msBetweenShots, numShots;

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

  $(function() {
    var canvas, ctx, initSettingsSliders, onAllow, onDeny, snapshotButtonClicked, socket, takeShots, turnLoadingMessages, video;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext("2d");
    video = $("video#camera")[0];
    turnLoadingMessages = function(state) {
      if (state === "on") {
        $('#take-snapshots').attr('disabled', true);
        return $('#loading').show();
      } else {
        $('#take-snapshots').removeAttr('disabled');
        return $('#loading').hide();
      }
    };
    socket = io.connect("http://178.79.170.14:8080/");
    socket.on("connect", function() {
      turnLoadingMessages('off');
      return socket.on("gifDone", function(data) {
        $("#gif").attr('src', data.url);
        $("#gif-url").attr('href', data.url);
        $("#gif-url").text(data.url);
        $('#be-patient').hide();
        $('#take-snapshots').removeAttr('disabled');
        return $('#loading').hide();
      });
    });
    takeShots = function(gifId) {
      var i, takeShot, _i, _ref, _results;
      turnLoadingMessages('on');
      $('#be-patient').show();
      console.log("taking shots for GIF " + gifId);
      takeShot = function(numInSequence) {
        return function() {
          console.log("taking shot " + numInSequence);
          ctx.drawImage(video, 0, 0);
          return socket.emit("newSnapshot", {
            gifId: gifId,
            numInSequence: numInSequence,
            imgContents: canvas.toDataURL("image/jpeg", .7)
          });
        };
      };
      _results = [];
      for (i = _i = 0, _ref = numShots(); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(setTimeout(takeShot(i), i * msBetweenShots()));
      }
      return _results;
    };
    socket.on("newGifReady", function(data) {
      console.log("new Gif Ready!");
      return takeShots(data.gifId);
    });
    snapshotButtonClicked = function() {
      return socket.emit('newGif', {
        numShots: numShots()
      });
    };
    initSettingsSliders = function() {
      var FizzyText, gui, set, text;
      FizzyText = function() {
        this.lengthInSeconds = LENGTH_IN_SECONDS;
        return this.FPS = FPS;
      };
      set = function(settingName) {
        var setterFunc;
        return setterFunc = function(newVal) {
          return window[settingName] = newVal;
        };
      };
      text = new FizzyText();
      gui = new dat.GUI();
      gui.add(text, "lengthInSeconds", .5, 4, .5).onChange(set("LENGTH_IN_SECONDS"));
      return gui.add(text, "FPS", 1, 20).onChange(set("FPS"));
    };
    onAllow = function(localMediaStream) {
      return video.src = window.URL.createObjectURL(localMediaStream);
    };
    onDeny = function(error) {
      return console.log("error: " + error.code);
    };
    initSettingsSliders();
    navigator.getUserMedia({
      video: true
    }, onAllow, onDeny);
    return $("#take-snapshots").on("click", snapshotButtonClicked);
  });

}).call(this);
