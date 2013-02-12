WIDTH = 640
HEIGHT = 480
LENGTH_IN_SECONDS = 2
FPS = 12
msBetweenShots = ->
  1000 / FPS

numShots = ->
  LENGTH_IN_SECONDS * FPS

socket = io.connect(":8080")
socket.on "connect", ->

  window.sendShots = ->
    snapshotListItems = $('#snapshots').children()
    socket.emit 'numImages', {numImages: snapshotListItems.length}
    snapshotListItems.each (index, li) ->
      img = li.children[0]
      socket.emit 'image', {
        contents: img.src
        imgNum: index
      }

  window.sendDone = ->
    socket.emit 'done'


navigator.getUserMedia = navigator.getUserMedia or navigator.webkitGetUserMedia or navigator.mozGetUserMedia or navigator.msGetUserMedia
onSuccess = (localMediaStream) ->
  video = $("video#camera")[0]
  video.src = window.URL.createObjectURL(localMediaStream)
  canvas = document.createElement("canvas")
  canvas.width = WIDTH
  canvas.height = HEIGHT
  ctx = canvas.getContext("2d")
  snapshots = $("#snapshots")[0]
  takeShot = ->

    # Grab still from webcam, append it to list of snapshots
    newShot = document.createElement("img")
    newShotContainer = document.createElement("li")

    # By default not displaying, because we're waiting
    newShotContainer.style.display = "none"
    newShotContainer.appendChild newShot
    ctx.drawImage video, 0, 0
    newShot.src = canvas.toDataURL("image/jpeg", 1.0)
    newShot.height = video.clientHeight
    snapshots.appendChild newShotContainer

  rotateInterval = undefined
  displaySnapshots = ->
    sendShots()

    snaps = snapshots.children
    currentSnap = snaps[0]
    rotateToNextSnap = ->
      prevSnap = currentSnap.previousElementSibling or snaps[snaps.length - 1]
      prevSnap.style.display = "none"
      currentSnap.style.display = "block"
      currentSnap = currentSnap.nextElementSibling or snaps[0]

    rotateInterval = setInterval(rotateToNextSnap, msBetweenShots())

  removeChildren = (node) ->
    node.removeChild node.lastChild  while node.hasChildNodes()

  takeShots = ->
    i = 0

    while i < numShots()
      setTimeout takeShot, i * msBetweenShots()
      i++

    # Stop rotation
    clearInterval rotateInterval

    # Clear previous animation
    removeChildren snapshots

    # Show the new snaps
    setTimeout displaySnapshots, numShots() * msBetweenShots() + 1000

  $("button").on "click", takeShots

onError = (error) ->
  console.log "error: " + error.code

navigator.getUserMedia
  video: true
, onSuccess, onError
FizzyText = ->
  @lengthInSeconds = LENGTH_IN_SECONDS
  @FPS = FPS

setLengthInSeconds = (lengthInSeconds) ->
  LENGTH_IN_SECONDS = lengthInSeconds

setFPS = (fps) ->
  FPS = fps

window.onload = ->
  text = new FizzyText()
  gui = new dat.GUI()
  gui.add(text, "lengthInSeconds", .5, 4).step(.5).onChange setLengthInSeconds
  gui.add(text, "FPS", 1, 20).onChange setFPS


