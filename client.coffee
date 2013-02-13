WIDTH = 640
HEIGHT = 480
LENGTH_IN_SECONDS = 1.5
FPS = 10
msBetweenShots = ->
  1000 / FPS

numShots = ->
  LENGTH_IN_SECONDS * FPS

snapshots = []


navigator.getUserMedia = navigator.getUserMedia or navigator.webkitGetUserMedia or navigator.mozGetUserMedia or navigator.msGetUserMedia
onSuccess = (localMediaStream) ->
  video = $("video#camera")[0]
  video.src = window.URL.createObjectURL(localMediaStream)
  canvas = document.createElement("canvas")
  canvas.width = WIDTH
  canvas.height = HEIGHT
  ctx = canvas.getContext("2d")

  takeShot = ->
    ctx.drawImage video, 0, 0
    snapshots.push canvas.toDataURL("image/jpeg", .7)

  takeShots = ->
    $('#be-patient').show()
    $('button').attr('disabled', true);
    $('#loading').show()
    snapshots = []
    i = 0

    while i < numShots()
      setTimeout takeShot, i * msBetweenShots()
      i++

    # Show the new snaps
    setTimeout sendShots, numShots() * msBetweenShots() + 1000

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



socket = io.connect("http://178.79.170.14:8080/")
socket.on "connect", ->

  $('button').removeAttr('disabled')
  $('#loading').hide()

  socket.on "imgur", (data) ->
    $("#gif").attr('src', data.url)
    $("#gif-url").attr('href', data.url)
    $("#gif-url").text(data.url)
    $('#be-patient').hide()
    $('button').removeAttr('disabled')
    $('#loading').hide()


  window.sendShots = ->
    socket.emit 'numImages', {numImages: snapshots.length}

    for img, index in snapshots
      console.log img
      socket.emit 'image', {
        contents: img,
        imgNum: index
      }