IMGUR_API_KEY = "652deb70e66249c7046971f0850f144d"

io  = require('socket.io').listen(8080)
fs  = require('fs')
im = require('imagemagick')

imgur = require('imgur');

imgur.setKey(IMGUR_API_KEY)

postImageToImgur = (filename) ->
  imgur.upload filename, (response) ->
    console.log response.links.original


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
      imagesReceived = 0
      expectedImages = 0
      im.convert ['*.jpg', '-loop', '0', 'animation.gif'], (err) ->
        if err
          throw err

        postImageToImgur 'animation.gif'



writeFile = (data, imgNum) ->
  fs.writeFile "file#{imgNum}.jpg", data, 'base64', (err) ->
    if err
      console.log('File could not be saved.')
    else
      console.log('File saved.')
