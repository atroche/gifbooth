var $ = function(selector) {
  return document.querySelector(selector);
};

navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;



navigator.getUserMedia({video: true}, function(localMediaStream){

  var video = $('video#camera');

  video.src = window.URL.createObjectURL(localMediaStream);

  var canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;

  var ctx = canvas.getContext('2d');
  var snapshots = $('#snapshots');

  var takeShot = function() {
    // Grab still from webcam, append it to list of snapshots

    var newShot = document.createElement('img');
    var newShotListItem = document.createElement('li');
    newShotListItem.style.display = "none";

    newShotListItem.appendChild(newShot);

    ctx.drawImage(video, 0, 0);
    newShot.src = canvas.toDataURL('image/webp');

    snapshots.appendChild(newShotListItem);
  };

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

    setInterval(rotateToNextSnap, 300);

  }

  var takeShots = function() {
    for(var i=0;i<4;i++) {
      setTimeout(takeShot, i * 300);
    }

    setTimeout(displaySnapshots, 1000);
  }

  $('button').addEventListener('click', takeShots);

});

