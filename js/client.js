// Generated by CoffeeScript 1.3.3
(function() {
  var HEIGHT, WIDTH, msBetweenShots;

  WIDTH = 320;

  HEIGHT = 240;

  window.LENGTH_IN_SECONDS = 1.5;

  window.FPS = 10;

  msBetweenShots = function() {
    return 1000 / FPS;
  };

  window.numShots = function() {
    return Math.floor(LENGTH_IN_SECONDS * FPS);
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
    socket = io.connect("/");
    socket.on("connect", function() {
      turnLoadingMessages('off');
      return socket.on("gifDone", function(data) {
        var url;
        url = "/" + data.url;
        $("#gif").attr('src', url);
        return $("#gif").on('load', function() {
          $("#gif-url").attr('href', url);
          $("#gif-url").text("Direct URL");
          $('#be-patient').hide();
          $('#take-snapshots').removeAttr('disabled');
          $('#loading').hide();
          return $('#countdown').text('');
        });
      });
    });
    takeShots = function(gifId) {
      var i, resetCountdown, takeShot, _i, _ref;
      turnLoadingMessages('on');
      $('#be-patient').show();
      console.log("taking shots for GIF " + gifId);
      takeShot = function(numInSequence) {
        return function() {
          console.log("taking shot " + numInSequence);
          ctx.drawImage(video, 0, 0, 320, 240);
          return socket.emit("newSnapshot", {
            gifId: gifId,
            numInSequence: numInSequence,
            imgContents: canvas.toDataURL("image/jpeg", .7)
          });
        };
      };
      for (i = _i = 0, _ref = numShots(); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        setTimeout(takeShot(i), i * msBetweenShots());
      }
      resetCountdown = function() {
        return $('#countdown').text('Stop');
      };
      return setTimeout(resetCountdown, numShots() * msBetweenShots() + 100);
    };
    socket.on("newGifReady", function(data) {
      var countdown;
      console.log("new Gif Ready!");
      countdown = function(seconds) {
        var setNextCountDown;
        if (seconds === 0) {
          takeShots(data.gifId);
          return $('#countdown').text("Go!");
        } else {
          $('#countdown').text(seconds);
          setNextCountDown = function() {
            return countdown(seconds - 1);
          };
          return setTimeout(setNextCountDown, 1000);
        }
      };
      return countdown(3);
    });
    snapshotButtonClicked = function() {
      return socket.emit('newGif', {
        numShots: numShots(),
        FPS: FPS
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
      gui.add(text, "lengthInSeconds", .5, 4).step(.5).onChange(set("LENGTH_IN_SECONDS"));
      return gui.add(text, "FPS", 1, 20).step(1).onChange(set("FPS"));
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
