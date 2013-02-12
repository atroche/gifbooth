from images2gif import writeGif as write_gif
from PIL import Image
import argparse

parser = argparse.ArgumentParser(description='Convert jpgs to GIFs')

parser.add_argument('files', metavar='N', type=str, nargs='+')

args = parser.parse_args()


images = [Image.open(fname) for fname in args.files]

write_gif('ani.gif', images, repeat=True, subRectangles=False)