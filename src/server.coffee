io  = require('socket.io').listen(8080)
fs  = require('fs')
im = require('imagemagick')
uuid = require('node-uuid')
sys = require('sys')
exec = require('child_process').exec
_ = require('underscore')
models = require('./models')



gifs = []



io.sockets.on 'connection', (socket) ->

  socket.on 'newGif', (data) ->
    gif = new models.GIF(data.numShots, socket)
    gifs.push(gif)
    socket.emit 'newGifReady', gifId: gif.id


  socket.on 'newSnapshot', (snapData) ->
    # check for gif ID
    # if it's new, create a GIF
    # otherwise get the existing GIF to handle it
    gif = _(gifs).findWhere(id: snapData.gifId)
    if gif
      gif.addSnapshot(snapData)
    else
      socket.emit 'error'

