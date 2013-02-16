exec = require('child_process').exec
sys = require('sys')
fs = require('fs')
im = require('imagemagick')
uuid = require('node-uuid')
_ = require('underscore')

GIF_BUILD_PATH = "#{process.env.HOME}/gifbuild/"
PROJECT_DIRECTORY = "#{process.env.HOME}/dev/gifbooth/"


# Helper function for better logging
puts = (error, stdout, stderr) ->
  if error
    sys.puts("error")
    sys.puts(error)
  if stdout
    sys.puts("stdout")
    sys.puts(stdout)
  if stderr
    sys.puts("stderr")
    sys.puts(stderr)




class Snapshot
  # represents one image, on file
  constructor: (imgContents, gif, @numInSequence) ->
    @readyForGiffing = false

    imgContents = imgContents.replace(/^data:image\/jpeg;base64,/, "")

    filename = "#{GIF_BUILD_PATH}#{gif.id}#{@numInSequence}.jpg"

    fs.writeFile filename, imgContents, 'base64', (err) =>
      if err
        console.log "writing file error"
        console.log err
        return

      @readyForGiffing = true
      console.log "I'm snapshot #{@numInSequence} and I'm ready: #{@readyForGiffing}"
      gif.checkIfReady()


class GIF
  # Handles the creation of a GIF file from many Snapshots
  constructor: (@expectedNumberOfImages, @socket, @FPS) ->
    @id = uuid.v4()
    @snapshots = []


  addSnapshot: (snapData) ->
    snapshot = new Snapshot(snapData.imgContents,
                            this, snapData.numInSequence)
    @snapshots.push snapshot


  createGif: ->
    # sort them in order, get python script to convert them
    @snapshots = _(@snapshots).sortBy (snapshot) -> snapshot.numInSequence

    snapFilenames = ("#{GIF_BUILD_PATH}#{@id}#{snapshot.numInSequence}.jpg" \
                     for snapshot in @snapshots).join(" ")

    outputFilename = "gifs/#{@id}.gif"
    command = "python makegif.py -d #{1/@FPS} -o #{outputFilename} #{snapFilenames}"

    exec command, (cwd: PROJECT_DIRECTORY), (error, stdout, stderr) =>
      puts(error, stdout, stderr)
      unless error
        @socket.emit "gifDone", url: outputFilename


  checkIfReady: ->
    console.log "checking if ready"
    console.log "received #{@snapshots.length} snapshots so far"
    enoughSnaps = @snapshots.length == @expectedNumberOfImages
    if enoughSnaps
      snapsReady = _(@snapshots).all (snapshot) -> snapshot.readyForGiffing
      console.log "snaps ready? #{snapsReady}"
      for snap in @snapshots
        console.log "snap #{snap.numInSequence} is ready? #{snap.readyForGiffing}"
      if snapsReady
        console.log "creating gif"
        return @createGif()

module.exports =
  GIF: GIF
  Snapshot: Snapshot