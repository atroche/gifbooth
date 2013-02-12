from images2gif import writeGif as write_gif
from PIL import Image

fnames = ["file%d.jpg" % i for i in xrange(10)]
images = [Image.open(fname) for fname in fnames]

write_gif('ani.gif', images, repeat=True, subRectangles=False)