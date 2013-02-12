io  = require('socket.io').listen(8080)
fs  = require('fs')
im = require('imagemagick')

io.sockets.on 'connection', (socket) ->
  expectedImages = null
  imagesReceived = null

  socket.on 'numImages', (data) ->
    expectedImages = data.numImages


  socket.on 'image', (data) ->
    imgData = data.contents.replace(/^data:image\/jpeg;base64,/, "")
    writeFile imgData, data.imgNum
    imagesReceived += 1
    if imagesReceived >= expectedImages
      im.convert ['*.jpg', '-loop', '0', 'animation.gif']


writeFile = (data, imgNum) ->
  fs.writeFile "file#{imgNum}.jpg", data, 'base64', (err) ->
    if err
      console.log('File could not be saved.')
    else
      console.log('File saved.')
