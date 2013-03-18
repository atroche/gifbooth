from images2gif import writeGif as write_gif

import sys
sys.path.append("/Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site-packages/")

from PIL import Image
import argparse

parser = argparse.ArgumentParser(description='Convert jpgs to GIFs')

parser.add_argument('files', metavar='N', type=str, nargs='+')

parser.add_argument('-o', dest='output_file')
parser.add_argument('-d', dest='duration')


args = parser.parse_args()


images = [Image.open(fname) for fname in args.files]

write_gif(args.output_file, images, repeat=True, subRectangles=True,
          duration=float(args.duration))

print "Hey! It all appears to have went well."