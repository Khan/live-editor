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
parser.add_argument('--preset', help="Either thumbs or fullsize")
parser.add_argument('--width', help="Image max-width", type=int, default=128)
parser.add_argument('--height', help="Image max-height", type=int, default=128)
parser.add_argument('--target', help="Target directory")
parser.add_argument('--ext', help="The extension you want the files saved as. This defaults to whatever format the source file is.")
 
args = parser.parse_args()
 
target_size = (args.height, args.width)
target_dir = os.path.join(args.dir, "resized")
target_ext = args.ext

if args.preset == 'thumbs':
    target_size = (128, 128)
    target_dir = os.path.join(args.dir, "thumbs")
    target_ext = 'png'
elif args.preset == 'fullsize':
    target_size = (640, 640)
    target_dir = args.dir
    target_ext = 'png'

imgs = [os.path.join(args.dir,file) for file in os.listdir(args.dir)]
print 'Resizing to (%s) and saving to %s' % (target_size, target_dir)
 
if not os.path.exists(target_dir):
    os.mkdir(target_dir)
 
for img_file in imgs:
    if os.path.isfile(img_file) and imghdr.what(img_file):
        t = [target_size[0], target_size[1]]
        im = Image.open(img_file)
        xratio = float(im.size[0])/t[0]
        yratio = float(im.size[1])/t[1]
        if xratio > yratio:
            t[1] = int(im.size[1]/xratio)
        else:
            t[0] = int(im.size[0]/yratio)
        print 'Resizing %s' % (t)
        thumb = im.resize(t, Image.ANTIALIAS)
        file_name = os.path.basename(imgFile)
        if target_ext:
            file_name = os.path.splitext(file_name)[0] + "." + target_ext
        thumb.save(os.path.join(thumbs_dir,file_name))
print "Complete."
