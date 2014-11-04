""" This is a command line tool to create thumbnails for a group of images.

Point it to a directory and it will create a ./thumbs dir inside the directory,
and place a thumbnail for every image in the directory inside ./thumbs
"""

import Image
import os, argparse, sys
import imghdr
 
parser = argparse.ArgumentParser(description='Create thumbs for all the images in a directory')
parser.add_argument('dir', help="The directory the images are in")
parser.add_argument('--preset', help="Either thumbs or fullsize")
parser.add_argument('--width', help="Image max-width", type=int, default=128)
parser.add_argument('--height', help="Image max-height", type=int, default=128)
parser.add_argument('--target', help="Target directory")
 
args = parser.parse_args()
 
target_size = (args.height, args.width)
target_dir = os.path.join(args.dir, "resized")

if args.preset == 'thumbs':
    target_size = (128, 128)
    target_dir = os.path.join(args.dir, "thumbs")
elif args.preset == 'fullsize':
    target_size = (640, 640)
    target_dir = args.dir

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
        thumb.save(os.path.join(target_dir, os.path.basename(img_file)))
print "Complete."
