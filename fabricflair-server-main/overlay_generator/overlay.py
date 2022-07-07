import sys
from PIL import Image 


path_1 = sys.argv[1] # IMG1 Path
path_2 = sys.argv[2] # IMG2 Path
width = int(sys.argv[3]) # Width_image_2
height = int(sys.argv[4]) # height_image_2
overlayName = sys.argv[5]


img1  = Image.open(path_1).convert('RGB')
img2  = Image.open(path_2)
img1 = img1.resize((2700,4050))
img2 = img2.resize((width, height))


paste_width = int((2700/2)-(width/2))
paste_height = int((4050/2)-(height/2))
img1.paste(img2,(paste_width,paste_height),img2)
img1.save(overlayName,quality =100,subsampling=0)

print("done")