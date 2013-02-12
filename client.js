// Generated by CoffeeScript 1.3.3
(function() {
  var FPS, FizzyText, HEIGHT, LENGTH_IN_SECONDS, WIDTH, msBetweenShots, numShots, onError, onSuccess, setFPS, setLengthInSeconds, socket;

  WIDTH = 640;

  HEIGHT = 480;

  LENGTH_IN_SECONDS = 2;

  FPS = 12;

  msBetweenShots = function() {
    return 1000 / FPS;
  };

  numShots = function() {
    return LENGTH_IN_SECONDS * FPS;
  };

  socket = io.connect("http://0.0.0.0:8080");

  socket.on("connect", function() {
    return window.sendShots = function() {
      return $('#snapshots').children().each(function(index, li) {
        var img;
        img = li.children[0];
        return socket.emit('image', {
          contents: img.src,
          imgNum: index
        });
      });
    };
  });

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  onSuccess = function(localMediaStream) {
    var canvas, ctx, displaySnapshots, removeChildren, rotateInterval, snapshots, takeShot, takeShots, video;
    video = $("video#camera")[0];
    video.src = window.URL.createObjectURL(localMediaStream);
    canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext("2d");
    snapshots = $("#snapshots")[0];
    takeShot = function() {
      var newShot, newShotContainer;
      newShot = document.createElement("img");
      newShotContainer = document.createElement("li");
      newShotContainer.style.display = "none";
      newShotContainer.appendChild(newShot);
      ctx.drawImage(video, 0, 0);
      newShot.src = canvas.toDataURL("image/jpeg", 1.0);
      newShot.height = video.clientHeight;
      return snapshots.appendChild(newShotContainer);
    };
    rotateInterval = void 0;
    displaySnapshots = function() {
      var currentSnap, rotateToNextSnap, snaps;
      sendShots();
      snaps = snapshots.children;
      currentSnap = snaps[0];
      rotateToNextSnap = function() {
        var prevSnap;
        prevSnap = currentSnap.previousElementSibling || snaps[snaps.length - 1];
        prevSnap.style.display = "none";
        currentSnap.style.display = "block";
        return currentSnap = currentSnap.nextElementSibling || snaps[0];
      };
      return rotateInterval = setInterval(rotateToNextSnap, msBetweenShots());
    };
    removeChildren = function(node) {
      var _results;
      _results = [];
      while (node.hasChildNodes()) {
        _results.push(node.removeChild(node.lastChild));
      }
      return _results;
    };
    takeShots = function() {
      var i;
      i = 0;
      while (i < numShots()) {
        setTimeout(takeShot, i * msBetweenShots());
        i++;
      }
      clearInterval(rotateInterval);
      removeChildren(snapshots);
      return setTimeout(displaySnapshots, numShots() * msBetweenShots() + 1000);
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

}).call(this);
