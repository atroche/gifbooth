WIDTH = 640
HEIGHT = 480
window.LENGTH_IN_SECONDS = 1.5
window.FPS = 5

msBetweenShots = ->
  1000 / FPS

window.numShots = ->
  Math.floor(LENGTH_IN_SECONDS * FPS)


$ ->

  # for cross-browser support
  navigator.getUserMedia = navigator.getUserMedia \
                           or navigator.webkitGetUserMedia \
                           or navigator.mozGetUserMedia \
                           or navigator.msGetUserMedia


  canvas = document.createElement("canvas")
  canvas.width = WIDTH
  canvas.height = HEIGHT
  ctx = canvas.getContext("2d")

  video = $("video#camera")[0]


  turnLoadingMessages = (state) ->
    if state == "on"
      $('#take-snapshots').attr('disabled', true);
      $('#loading').show()
    else
      $('#take-snapshots').removeAttr('disabled')
      $('#loading').hide()


  socket = io.connect("http://178.79.170.14:8080/")
  socket.on "connect", ->
    turnLoadingMessages('off')

    socket.on "gifDone", (data) ->
      url = "http://178.79.170.14/" + data.url;
      $("#gif").attr('src', url)
      $("#gif-url").attr('href', url)
      $("#gif-url").text("Direct URL")
      $('#be-patient').hide()
      $('#take-snapshots').removeAttr('disabled')
      $('#loading').hide()




  takeShots = (gifId) ->

    turnLoadingMessages('on')
    $('#be-patient').show()

    console.log "taking shots for GIF #{gifId}"

    takeShot = (numInSequence) ->
      return ->
        console.log "taking shot #{numInSequence}"
        ctx.drawImage video, 0, 0

        socket.emit "newSnapshot",
          gifId: gifId,
          numInSequence: numInSequence
          imgContents: canvas.toDataURL("image/jpeg", .7)

    for i in [0 ... numShots()]
      setTimeout(takeShot(i), i * msBetweenShots())

  socket.on "newGifReady", (data) ->
    console.log "new Gif Ready!"
    takeShots(data.gifId)


  snapshotButtonClicked = ->
    socket.emit 'newGif', (numShots: numShots(), FPS: FPS)


  initSettingsSliders = ->

    FizzyText = ->
      @lengthInSeconds = LENGTH_IN_SECONDS
      @FPS = FPS

    set = (settingName) ->
      setterFunc = (newVal) ->
        window[settingName] = newVal

    text = new FizzyText()
    gui = new dat.GUI()
    gui.add(text, "lengthInSeconds", .5, 4, .5).onChange set("LENGTH_IN_SECONDS")
    gui.add(text, "FPS", 1, 20, 1).onChange set("FPS")




  onAllow = (localMediaStream) ->
    video.src = window.URL.createObjectURL(localMediaStream)

  onDeny = (error) ->
    console.log "error: " + error.code


  initSettingsSliders()

  navigator.getUserMedia video: true, onAllow, onDeny

  $("#take-snapshots").on "click", snapshotButtonClicked
