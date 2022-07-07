import sys, os
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw

master_path = sys.argv[1] # File Path
output_path = sys.argv[2] # Output Folder Path


fabric_file = master_path[master_path.rfind('/')+1::] 
fabric = Image.open(master_path).convert('RGB')

fabric_resized = fabric.resize((720,1280),Image.ANTIALIAS)
fabric_resized.save(output_path + "/" +fabric_file, "JPEG", quality=15)
print("done")
