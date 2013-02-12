IMGUR_API_KEY = "652deb70e66249c7046971f0850f144d"

io  = require('socket.io').listen(8080)
fs  = require('fs')
im = require('imagemagick')
uuid = require('node-uuid')

imgur = require('imgur');

imgur.setKey(IMGUR_API_KEY)

postImageToImgur = (filename, socket) ->
  imgur.upload filename, (response) ->
    console.log response.error
    console.log response
    console.log response.links.original
    socket.emit 'imgur', {url: response.links.original}


io.sockets.on 'connection', (socket) ->
  expectedImages = null
  imagesReceived = null
  uploadPrefix = null

  socket.on 'numImages', (data) ->
    expectedImages = data.numImages
    uploadPrefix = uuid.v4()


  socket.on 'image', (data) ->
    imgData = data.contents.replace(/^data:image\/jpeg;base64,/, "")
    filename = "/tmp/#{uploadPrefix}#{data.imgNum}.jpg"
    fs.writeFile filename, imgData, 'base64', (err) ->
      im.convert [filename, '-resize', '320x240', filename], ->
        imagesReceived += 1
        if imagesReceived >= expectedImages
          imagesReceived = 0
          expectedImages = 0
          im.resize
          im.convert ["/tmp/#{uploadPrefix}*.jpg", '-resize', '320x240','-loop', '0', 'animation.gif'], (err) ->
            if err
              console.log err

            postImageToImgur 'animation.gif', socket



writeFile = (data, filename) ->
  fs.writeFile filename, data, 'base64', (err) ->

