allowCrossDomain = (req, res, next) ->
    res.header('Access-Control-Allow-Origin', ['localhost', '192.168.1.15', 'gifbooth.likelikelikelike.com'])
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')

    next()



express = require('express')
app = express()
app.use(express.bodyParser())
app.use(express.static(__dirname + '/../'))
app.use(allowCrossDomain)
http = require('http')
server = http.createServer(app)

server.listen(8080)

io  = require('socket.io').listen(server)
fs  = require('fs')

uuid = require('node-uuid')
sys = require('sys')
exec = require('child_process').exec
_ = require('underscore')
models = require('./models')



most_recent_gifs = ->
  _.sortBy fs.readdirSync('gifs/'), (filename) ->
    fs.statSync('gifs/' + filename).mtime


app.get '/recent', (req, res) ->
  most_recent = _.chain(most_recent_gifs()).reverse().first(5).value()
  res.json most_recent


app.post '/email', (req, res) ->
  fs.open 'emails', 'a', (err, fd) ->
    fs.write(fd, "#{req.body.email} #{req.body.id}\n")
    res.json req.body


gifs = []



io.sockets.on 'connection', (socket) ->

  socket.on 'newGif', (data) ->
    gif = new models.GIF(data.numShots, socket, data.FPS)
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
