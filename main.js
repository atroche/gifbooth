var WIDTH = 640;
var HEIGHT = 480;

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

    rotateInterval = setInterval(rotateToNextSnap, 300);

  }

  var removeChildren = function(node) {
    while (node.hasChildNodes()) {
      node.removeChild(node.lastChild);
    }
  }

  var takeShots = function() {
    for(var i=0;i<6;i++) {
      setTimeout(takeShot, i * 200);
    }

    // Stop rotation
    clearInterval(rotateInterval);
    // Clear previous animation
    removeChildren(snapshots);

    // Show the new snaps
    setTimeout(displaySnapshots, 1500);
  }

  $('button').addEventListener('click', takeShots);

}

var onError = function(error) {
  console.log('error: ' + error.code);
}

navigator.getUserMedia({video: true}, onSuccess, onError);