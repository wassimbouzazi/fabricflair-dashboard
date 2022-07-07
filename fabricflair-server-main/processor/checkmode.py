from PIL import Image
import sys

path = sys.argv[1] # Third path, for masterfiles location.

fabric = Image.open(path)
fabric_mode = fabric.mode

if (fabric_mode != "CMYK"):
    print('noncmyk')
else:
    print('cmyk')