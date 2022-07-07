from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw
import random
import string
''' Import config file '''
from config import NORMAL_WIDTH
from config import SEAMLESS_WIDTH
from config import GENERATOR_NAME
''' Exif manipulation '''
import piexif

''' One fabric part '''
class FabricPart:
    # ((w, h), (x,y))
    def __init__(self, size, location):
        self.size = size
        self.location = location

''' Return fabric parts to just paste in a loop '''
def returnFabricParts(cut_type, choice, seamless, INCHES, HEADER):
    WIDTH = NORMAL_WIDTH if seamless == 0 else SEAMLESS_WIDTH  
    HEIGHT = 8400 if choice == 56 else 6300
    SAFETY_SPRAY = 37
    if INCHES != 0: HEADER = 0

    if cut_type == 'full-panel':
        if seamless:
            return [
                FabricPart((WIDTH, HEIGHT-(HEADER*2)-(INCHES*2)), (0, HEADER+INCHES))
            ]
        else:
            return [
                FabricPart(
                    (WIDTH-(SAFETY_SPRAY*2)-(INCHES*2), HEIGHT-(HEADER*2)-(INCHES*2)),
                    (INCHES+SAFETY_SPRAY, HEADER+INCHES)
                )
            ]
    elif cut_type == 'fat-half':
        half_height = ((HEIGHT-(HEADER*2+INCHES*2))//2)-INCHES
        if seamless:
            return [
                FabricPart((WIDTH, half_height), (0, HEADER+INCHES)),
                FabricPart((WIDTH, half_height), (0, HEIGHT-(HEADER+half_height)-INCHES))
            ]
        else:
            return [
                FabricPart(
                    (WIDTH-(SAFETY_SPRAY*2)-(INCHES*2), half_height),
                    (INCHES+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (WIDTH-(SAFETY_SPRAY*2)-(INCHES*2), half_height),
                    (INCHES+SAFETY_SPRAY, HEIGHT-(HEADER+half_height)-INCHES)
                )
            ]
    elif cut_type == 'fat-quarter':
        half_height = ((HEIGHT-(HEADER*2+INCHES*2))//2)-INCHES
    
        if seamless:
            half_width = (WIDTH-INCHES*2)//2
            return [
                FabricPart((half_width, half_height), (0, HEADER+INCHES)),
                FabricPart((half_width, half_height), (half_width+INCHES*2, HEADER+INCHES)),
                FabricPart((half_width, half_height), (0, HEIGHT-(HEADER+half_height)-INCHES)),
                FabricPart((half_width, half_height), (half_width+INCHES*2, HEIGHT-(HEADER+half_height)-INCHES))
            ]
        else:
            half_width = (WIDTH-(INCHES*4)-(SAFETY_SPRAY*2))//2
            return [
                FabricPart(
                    (half_width, half_height),
                    (INCHES+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (half_width, half_height),
                    (half_width+INCHES*3+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (half_width, half_height),
                    (INCHES+SAFETY_SPRAY, HEIGHT-(HEADER+half_height)-INCHES)
                ),
                FabricPart(
                    (half_width, half_height),
                    (half_width+INCHES*3+SAFETY_SPRAY, HEIGHT-(HEADER+half_height)-INCHES)
                )
            ]
    elif cut_type == 'fat-8':
        half_height = ((HEIGHT-(HEADER*2+INCHES*2))//2)-INCHES*3
        quarter_height = half_height // 2
    
        if seamless:
            half_width = (WIDTH-INCHES*2)//2
            return [
                # UPPER 4
                FabricPart((half_width, quarter_height), (0, HEADER+INCHES)),
                FabricPart((half_width, quarter_height), (half_width+INCHES*2, HEADER+INCHES)),
                FabricPart((half_width, quarter_height), (0, quarter_height+HEADER+INCHES*3)),
                FabricPart((half_width, quarter_height), (half_width+INCHES*2, quarter_height+HEADER+INCHES*3)),

                # LOWER 4
                FabricPart((half_width, quarter_height), (0, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)),
                FabricPart((half_width, quarter_height), (half_width+INCHES*2, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)),
                FabricPart((half_width, quarter_height), (0, HEIGHT-(HEADER+quarter_height)-INCHES)),
                FabricPart((half_width, quarter_height), (half_width+INCHES*2, HEIGHT-(HEADER+quarter_height)-INCHES))
            ]
        else:
            half_width = (WIDTH-(INCHES*4)-(SAFETY_SPRAY*2))//2
            return [
                # UPPER 4
                FabricPart(
                    (half_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (half_width, quarter_height),
                    (half_width+INCHES*3+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (half_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, quarter_height+HEADER+INCHES*3)
                ),
                FabricPart(
                    (half_width, quarter_height),
                    (half_width+INCHES*3+SAFETY_SPRAY, quarter_height+HEADER+INCHES*3)
                ),
                # LOWER 4
                FabricPart(
                    (half_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)
                ),
                FabricPart(
                    (half_width, quarter_height),
                    (half_width+INCHES*3+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)
                ),
                FabricPart(
                    (half_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height)-INCHES)
                ),
                FabricPart(
                    (half_width, quarter_height),
                    (half_width+INCHES*3+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height)-INCHES)
                )
            ]
    elif cut_type == 'fat-9':
        third_height = ((HEIGHT-(HEADER*2+INCHES*6))//3)

        if seamless:
            third_width = (WIDTH-INCHES*4)//3
            return [
                # UPPER 3
                FabricPart((third_width, third_height), (0, HEADER+INCHES)),
                FabricPart((third_width, third_height), (third_width+INCHES*2, HEADER+INCHES)),
                FabricPart((third_width, third_height), (third_width*2+INCHES*4, HEADER+INCHES)),

                # MIDDLE 3
                FabricPart((third_width, third_height), (0, third_height+HEADER+INCHES*3)),
                FabricPart((third_width, third_height), (third_width+INCHES*2, third_height+HEADER+INCHES*3)),
                FabricPart((third_width, third_height), (third_width*2+INCHES*4, third_height+HEADER+INCHES*3)),

                # LOWER 3
                FabricPart((third_width, third_height), (0, HEIGHT-(HEADER+third_height)-INCHES)),
                FabricPart((third_width, third_height), (third_width+INCHES*2, HEIGHT-(HEADER+third_height)-INCHES)),
                FabricPart((third_width, third_height), (third_width*2+INCHES*4, HEIGHT-(HEADER+third_height)-INCHES))
            ]
        else:
            third_width = (WIDTH-(INCHES*4)-(SAFETY_SPRAY*2))//3
            return [
                # UPPER 3
                FabricPart(
                    (third_width, third_height),
                    (INCHES+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (third_width, third_height),
                    (third_width+INCHES*2+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (third_width, third_height),
                    (third_width*2+INCHES*3+SAFETY_SPRAY, HEADER+INCHES)
                ),
                # MIDDLE 3
                FabricPart(
                    (third_width, third_height),
                    (INCHES+SAFETY_SPRAY, third_height+HEADER+INCHES*3)
                ),
                FabricPart(
                    (third_width, third_height),
                    (third_width+INCHES*2+SAFETY_SPRAY, third_height+HEADER+INCHES*3)
                ),
                FabricPart(
                    (third_width, third_height),
                    (third_width*2+INCHES*3+SAFETY_SPRAY, third_height+HEADER+INCHES*3)
                ),
                # LOWER 3
                FabricPart(
                    (third_width, third_height),
                    (INCHES+SAFETY_SPRAY, HEIGHT-(HEADER+third_height)-INCHES)
                ),
                FabricPart(
                    (third_width, third_height),
                    (third_width+INCHES*2+SAFETY_SPRAY, HEIGHT-(HEADER+third_height)-INCHES)
                ),
                FabricPart(
                    (third_width, third_height),
                    (third_width*2+INCHES*3+SAFETY_SPRAY, HEIGHT-(HEADER+third_height)-INCHES)
                )
            ]
    elif cut_type == 'fat-12':
        half_height = ((HEIGHT-(HEADER*2+INCHES*2))//2)-INCHES*3
        quarter_height = half_height // 2
    
        if seamless:
            third_width = (WIDTH-INCHES*4)//3
            return [
                # UPPER 6
                FabricPart((third_width, quarter_height), (0, HEADER+INCHES)),
                FabricPart((third_width, quarter_height), (third_width+INCHES*2, HEADER+INCHES)),
                FabricPart((third_width, quarter_height), (third_width*2+INCHES*4, HEADER+INCHES)),
                FabricPart((third_width, quarter_height), (0, quarter_height+HEADER+INCHES*3)),
                FabricPart((third_width, quarter_height), (third_width+INCHES*2, quarter_height+HEADER+INCHES*3)),
                FabricPart((third_width, quarter_height), (third_width*2+INCHES*4, quarter_height+HEADER+INCHES*3)),
            
                # LOWER 6
                FabricPart((third_width, quarter_height), (0, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)),
                FabricPart((third_width, quarter_height), (third_width+INCHES*2, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)),
                FabricPart((third_width, quarter_height), (third_width*2+INCHES*4, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)),
                FabricPart((third_width, quarter_height), (0, HEIGHT-(HEADER+quarter_height)-INCHES)),
                FabricPart((third_width, quarter_height), (third_width+INCHES*2, HEIGHT-(HEADER+quarter_height)-INCHES)),
                FabricPart((third_width, quarter_height), (third_width*2+INCHES*4, HEIGHT-(HEADER+quarter_height)-INCHES))
            ]
        else:
            third_width = (WIDTH-(INCHES*4)-(SAFETY_SPRAY*2))//3
            return [
                # UPPER 6
                FabricPart(
                    (third_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (third_width, quarter_height),
                    (third_width+INCHES*2+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (third_width, quarter_height),
                    (third_width*2+INCHES*3+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (third_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, quarter_height+HEADER+INCHES*3)
                ),
                FabricPart(
                    (third_width, quarter_height),
                    (third_width+INCHES*2+SAFETY_SPRAY, quarter_height+HEADER+INCHES*3)
                ),
                FabricPart(
                    (third_width, quarter_height),
                    (third_width*2+INCHES*3+SAFETY_SPRAY, quarter_height+HEADER+INCHES*3)
                ),
                # LOWER 6
                FabricPart(
                    (third_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)
                ),
                FabricPart(
                    (third_width, quarter_height),
                    (third_width+INCHES*2+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)
                ),
                FabricPart(
                    (third_width, quarter_height),
                    (third_width*2+INCHES*3+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)
                ),
                FabricPart(
                    (third_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height)-INCHES)
                ),
                FabricPart(
                    (third_width, quarter_height),
                    (third_width+INCHES*2+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height)-INCHES)
                ),
                FabricPart(
                    (third_width, quarter_height),
                    (third_width*2+INCHES*3+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height)-INCHES)
                ),
            ]
    elif cut_type == 'fat-16':
        half_height = ((HEIGHT-(HEADER*2+INCHES*2))//2)-INCHES*3
        quarter_height = half_height // 2
    
        if seamless:
            quarter_width = (WIDTH-INCHES*6)//4
            return [
                # UPPER 8
                FabricPart((quarter_width, quarter_height), (0, HEADER+INCHES)),
                FabricPart((quarter_width, quarter_height), (quarter_width+INCHES*2, HEADER+INCHES)),
                FabricPart((quarter_width, quarter_height), (quarter_width*2+INCHES*4, HEADER+INCHES)),
                FabricPart((quarter_width, quarter_height), (quarter_width*3+INCHES*6, HEADER+INCHES)),

                FabricPart((quarter_width, quarter_height), (0, quarter_height+HEADER+INCHES*3)),
                FabricPart((quarter_width, quarter_height), (quarter_width+INCHES*2, quarter_height+HEADER+INCHES*3)),
                FabricPart((quarter_width, quarter_height), (quarter_width*2+INCHES*4, quarter_height+HEADER+INCHES*3)),
                FabricPart((quarter_width, quarter_height), (quarter_width*3+INCHES*6, quarter_height+HEADER+INCHES*3)),

                # LOWER 8
                FabricPart((quarter_width, quarter_height), (0, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)),
                FabricPart((quarter_width, quarter_height), (quarter_width+INCHES*2, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)),
                FabricPart((quarter_width, quarter_height), (quarter_width*2+INCHES*4, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)),
                FabricPart((quarter_width, quarter_height), (quarter_width*3+INCHES*6, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)),

                
                FabricPart((quarter_width, quarter_height), (0, HEIGHT-(HEADER+quarter_height)-INCHES)),
                FabricPart((quarter_width, quarter_height), (quarter_width+INCHES*2, HEIGHT-(HEADER+quarter_height)-INCHES)),
                FabricPart((quarter_width, quarter_height), (quarter_width*2+INCHES*4, HEIGHT-(HEADER+quarter_height)-INCHES)),
                FabricPart((quarter_width, quarter_height), (quarter_width*3+INCHES*6, HEIGHT-(HEADER+quarter_height)-INCHES))
            ]
        else:
            quarter_width = (WIDTH-(INCHES*5)-(SAFETY_SPRAY*2))//4
            return [
                # UPPER 8
                FabricPart(
                    (quarter_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width+INCHES*2+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width*2+INCHES*3+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width*3+INCHES*4+SAFETY_SPRAY, HEADER+INCHES)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, quarter_height+HEADER+INCHES*3)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width+INCHES*2+SAFETY_SPRAY, quarter_height+HEADER+INCHES*3)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width*2+INCHES*3+SAFETY_SPRAY, quarter_height+HEADER+INCHES*3)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width*3+INCHES*4+SAFETY_SPRAY, quarter_height+HEADER+INCHES*3)
                ),
                # LOWER 8
                FabricPart(
                    (quarter_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width+INCHES*2+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width*2+INCHES*3+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width*3+INCHES*4+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height*2)-INCHES*3)
                ),


                FabricPart(
                    (quarter_width, quarter_height),
                    (INCHES+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height)-INCHES)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width+INCHES*2+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height)-INCHES)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width*2+INCHES*3+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height)-INCHES)
                ),
                FabricPart(
                    (quarter_width, quarter_height),
                    (quarter_width*3+INCHES*4+SAFETY_SPRAY, HEIGHT-(HEADER+quarter_height)-INCHES)
                )
            ]

''' Return full fabric type name to draw on image '''
def returnFabricTypeName(fabric_type):
    if (fabric_type == "14aida"):
        return "14-Aida"
    elif (fabric_type == "16aida"):
        return "16-Aida"
    elif (fabric_type == "18aida"):
        return "18-Aida"
    elif (fabric_type == "28evenweave"):
        return "28-Evenweave"
    elif (fabric_type == "32evenweave"):
        return "32-Evenweave"
    elif (fabric_type == "36evenweave"):
        return "36-Evenweave"
    elif (fabric_type == "28linen"):
        return "28-Linen"
    elif (fabric_type == "32linen"):
        return "32-Linen"
    elif (fabric_type == "36linen"):
        return "36-Linen"
    elif (fabric_type == "40linen"):
        return "40-Linen"

''' Return two strings for each line '''
def returnLines(fabric_name):
    words = fabric_name.split(' ')
    firstLine = ''
    for i, word in enumerate(words):
        if len(firstLine+word) <= 22: 
            firstLine+=word+' '
        else:
            break
    return (firstLine, ' '.join(words[i:]))


''' Generate random string '''
def randomString():
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(5))

''' Change template color '''
def setTempColor(temp, hex, path, HEADER, randomTemplate, seamless):
    source = "-source.jpg" if seamless == 0 else "-source_seamless.jpg"
    template = "-template.jpg" if seamless == 0 else "-template_seamless.jpg"
    rgb = tuple(int(hex[i:i+2], 16) for i in (0, 2, 4))
    image = Image.open(path + temp + source)

    ''' Exif Loaded to readable format '''
    exif_dict = piexif.load(image.info.get('exif'))
    ''' ICC Profile '''
    icc_profile = image.info.get('icc_profile')
    ''' Dumpted to bytes '''
    exif_bytes = piexif.dump(exif_dict)

    image.paste( rgb, [0,HEADER,image.size[0],image.size[1]])
    image.save(path + temp + '-' + randomTemplate + template, "JPEG", dpi=(150,150), exif=exif_bytes, quality=100, icc_profile=icc_profile, optimize=False)


''' Return rotated image '''
def drawParts(template, fabric, cut_type,indx, location, size):
    if cut_type == 'fat-half':
        fabric = fabric.rotate(-90, expand=1)
    elif cut_type == 'fat-quarter':
        if indx == 3 or indx == 4:
            fabric = fabric.rotate(180, expand=1)
    elif cut_type == 'fat-8':
        if indx % 2 == 0:
            fabric = fabric.rotate(-90, expand=1)
        else:
            fabric = fabric.rotate(90, expand=1)
    elif cut_type == 'fat-12':
        if indx >= 7:
            fabric = fabric.rotate(180, expand=1)
    elif cut_type == 'fat-16':
        if indx in range(5,9) or indx in range(13,17):
            fabric = fabric.rotate(180, expand=1)


    print('Index '+str(indx))
    fabricSize = fabric.resize(size)
    template.paste(fabricSize, location, fabricSize)
    return template

def getNewSizes(srcWidth, srcHeight, maxWidth, maxHeight):
    ratio = min(maxWidth / srcWidth, maxHeight / srcHeight)
    return (int(srcWidth*ratio), int(srcHeight*ratio))