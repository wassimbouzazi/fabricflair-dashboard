import sys, os
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw

master_path = sys.argv[1] # File Path
output_path = sys.argv[2] # Output Folder Path
texture_path = sys.argv[3] #


fabric_file = master_path[master_path.rfind('/')+1::] 
fabric = Image.open(master_path).convert('RGB')
linen_full = Image.open(texture_path+"linen_full.png")
fabric_resized = fabric.resize(linen_full.size,Image.ANTIALIAS)
fabric_resized.paste(linen_full, (0, 0), linen_full)
fabric_resized.save(output_path + "/" +fabric_file, "JPEG", quality=15)
print("done")