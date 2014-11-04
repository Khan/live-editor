""" This is a command line tool to create thumbnails for a group of images.

Point it to a directory and it will create a ./thumbs dir inside the directory,
and place a thumbnail for every image in the directory inside ./thumbs
"""

print "* This package requires python pillow for image processing.\n* If you don't already have pillow install it with `pip install pillow`"

from PIL import Image
import os, argparse, sys
import imghdr
 
parser = argparse.ArgumentParser(description='Create thumbs for all the images in a directory')
parser.add_argument('dir', help="The directory the images are in")
parser.add_argument('--width', help="Thumbnail max-width", type=int, default=128)
parser.add_argument('--height', help="Thumbnail max-height", type=int, default=128)
parser.add_argument('--ext', help="The extension you want the files saved as. This defaults to whatever format the source file is.")
 
args = parser.parse_args()
 
target = (args.height, args.width)
imgs = [os.path.join(args.dir,file) for file in os.listdir(args.dir)]
thumbs_dir = os.path.join(args.dir, "thumbs")
print thumbs_dir
 
if not os.path.exists(thumbs_dir):
    os.mkdir(thumbs_dir)
 
for imgFile in imgs:
    if os.path.isfile(imgFile) and imghdr.what(imgFile):
        t = [target[0], target[1]]
        im = Image.open(imgFile)
        xratio = float(im.size[0])/t[0]
        yratio = float(im.size[1])/t[1]
        if xratio > yratio:
            t[1] = int(im.size[1]/xratio)
        else:
            t[0] = int(im.size[0]/yratio)
        thumb = im.resize(t, Image.ANTIALIAS)
        file_name = os.path.basename(imgFile)
        if args.ext :
            file_name = os.path.splitext(file_name)[0] + "." + args.ext
        thumb.save(os.path.join(thumbs_dir,file_name))
print "Complete."