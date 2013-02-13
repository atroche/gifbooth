from images2gif import writeGif as write_gif
from PIL import Image
import argparse

parser = argparse.ArgumentParser(description='Convert jpgs to GIFs')

parser.add_argument('files', metavar='N', type=str, nargs='+')

parser.add_argument('-o', dest='output_file')
parser.add_argument('--duration', dest='duration')


args = parser.parse_args()


images = [Image.open(fname) for fname in args.files]

write_gif(args.output_file, images, repeat=True, subRectangles=False,
          duration=float(args.duration || "0.1"))

print "Hey! It all appears to have went well."