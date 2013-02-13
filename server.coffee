IMGUR_API_KEY = "652deb70e66249c7046971f0850f144d"
GIF_BUILD_PATH = "#{GIF_BUILD_PATH}"

io  = require('socket.io').listen(8080)
fs  = require('fs')
im = require('imagemagick')
uuid = require('node-uuid')

sys = require('sys')
exec = require('child_process').exec

imgur = require('imgur');

imgur.setKey(IMGUR_API_KEY)

puts = (error, stdout, stderr) ->
  sys.puts("error")
  sys.puts(error)
  sys.puts("stdout")
  sys.puts(stdout)
  sys.puts("stderr")
  sys.puts(stderr)

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
    console.log imgData.length
    filename = "#{GIF_BUILD_PATH}#{uploadPrefix}#{data.imgNum}.jpg"
    fs.writeFile filename, imgData, 'base64', (err) ->
      im.convert [filename, '-resize', '320x240', filename], ->
        imagesReceived += 1
        if imagesReceived >= expectedImages

          console.log "It's python time"
          imArgs = ("#{GIF_BUILD_PATH}#{uploadPrefix}#{i}.jpg" for i in [0 ... expectedImages])
          console.log imArgs
          exec("ls", puts)
          output_file = "gifs/#{uploadPrefix}.gif"
          command = "python makegif.py -o #{output_file} #{imArgs.join(" ")}"
          console.log command
          exec command, (error, stdout, stderr) ->
            puts(error, stdout, stderr)
            unless error
              postImageToImgur output_file, socket
          # console.log imArgs
          # im.convert imArgs, (err) ->
          #   if err
          #     console.log err

          #   postImageToImgur 'animation.gif', socket

          imagesReceived = 0
          expectedImages = 0



writeFile = (data, filename) ->
  fs.writeFile filename, data, 'base64', (err) ->

