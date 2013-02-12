io  = require('socket.io').listen(8080)
fs  = require('fs')

io.sockets.on 'connection', (socket) ->
  socket.on 'image', (data) ->
    imgData = data.contents.replace(/^data:image\/jpeg;base64,/, "")
    writeFile imgData, data.imgNum



writeFile = (data, imgNum) ->
  fs.writeFile "file#{imgNum}.jpg", data, 'base64', (err) ->
    if err
      console.log('File could not be saved.')
    else
      console.log('File saved.')
