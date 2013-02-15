var WIDTH = 640;
var HEIGHT = 480;

var LENGTH_IN_SECONDS = 2;
var FPS = 12;

var msBetweenShots = function(){
  return 1000 / FPS;
}

var numShots = function(){
  return LENGTH_IN_SECONDS * FPS;
}


var $ = function(selector) {
  return document.querySelector(selector);
};

navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;



var onSuccess = function(localMediaStream){

  var video = $('video#camera');

  video.src = window.URL.createObjectURL(localMediaStream);

  var canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  var ctx = canvas.getContext('2d');
  var snapshots = $('#snapshots');

  var takeShot = function() {
    // Grab still from webcam, append it to list of snapshots

    var newShot = document.createElement('img');
    var newShotContainer = document.createElement('li');

    // By default not displaying, because we're waiting
    newShotContainer.style.display = "none";

    newShotContainer.appendChild(newShot);

    ctx.drawImage(video, 0, 0);
    newShot.src = canvas.toDataURL('image/webp');
    newShot.height = video.clientHeight;

    snapshots.appendChild(newShotContainer);
  };

  var rotateInterval;

  var displaySnapshots = function() {
    var snaps = snapshots.children;
    var currentSnap = snaps[0];

    var rotateToNextSnap = function() {
      var prevSnap = currentSnap.previousElementSibling ||
                     snaps[snaps.length - 1];

      prevSnap.style.display = "none";
      currentSnap.style.display = "block";

      currentSnap = currentSnap.nextElementSibling || snaps[0];
    }

    rotateInterval = setInterval(rotateToNextSnap, msBetweenShots());

  }

  var removeChildren = function(node) {
    while (node.hasChildNodes()) {
      node.removeChild(node.lastChild);
    }
  }

  var takeShots = function() {
    for(var i=0;i<numShots();i++) {
      setTimeout(takeShot, i * msBetweenShots());
    }

    // Stop rotation
    clearInterval(rotateInterval);
    // Clear previous animation
    removeChildren(snapshots);

    // Show the new snaps
    setTimeout(displaySnapshots, numShots() * msBetweenShots() + 1000);
  }

  $('button').addEventListener('click', takeShots);

}

var onError = function(error) {
  console.log('error: ' + error.code);
}

navigator.getUserMedia({video: true}, onSuccess, onError);

var FizzyText = function() {
  this.lengthInSeconds = LENGTH_IN_SECONDS;
  this.FPS = FPS;
};

var setLengthInSeconds = function(lengthInSeconds) {
  LENGTH_IN_SECONDS = lengthInSeconds;
}

var setFPS = function(fps) {
  FPS = fps;
}

window.onload = function() {
  var text = new FizzyText();
  var gui = new dat.GUI();


  gui.add(text, 'lengthInSeconds', .5, 4).step(.5).onChange(setLengthInSeconds);
  gui.add(text, 'FPS', 1, 20).onChange(setFPS);
};