from ast import Try
import sys, os, io
from warnings import catch_warnings
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw
from PIL import ImageCms

from datetime import datetime
''' Import config file '''
from config import *
''' Import required functions. '''
from functions import returnFabricTypeName
from functions import returnFabricParts
from functions import returnLines
from functions import setTempColor
from functions import randomString
from functions import drawParts
from functions import getNewSizes
''' Import logging '''
import logging
import traceback
''' Exif manipulation '''
import piexif
''' Pathlib to retrieve path '''
import pathlib

# TODO: Remove CMYK related code

''' Init logging '''
logging.basicConfig(filename=str(pathlib.Path().resolve())+'/processor/errors.log', filemode='a+', format='%(asctime)s - %(levelname)s - %(message)s', level=logging.INFO)

''' Handling input variables '''
fabric_name = sys.argv[1].replace("_"," ") # Fabric name (String < 42 characters)
fabric_masterfile = sys.argv[2] # Fabric masterfile name (String)
fabric_extension = sys.argv[3] # Fabric masterfile name (jpg/png/tiff)
fabric_id = sys.argv[4] # Fabric id (5*int-5*int)
seamless = int(sys.argv[5]) # Seamless check (0/1)
inches = int(sys.argv[6]) # Inches
keep_ratio = int(sys.argv[7]) # Respect ratio, for pictures in fabric
landscape = int(sys.argv[8]) # Portrait(0)/Landscape(1) mode 
background_color = sys.argv[9] # Custom color
path1 = sys.argv[10] # First path, for source files (images, fonts) location.
path2 = sys.argv[11] # Second path, for generated files location.
path3 = sys.argv[12] # Third path, for masterfiles location.
if sys.argv[13] != 'all': # All variations choice
    choice = int(sys.argv[13]) # Size choice (56/42)
    cut_type = sys.argv[14] #  Cut type (full/half/quarter)
    # Cut type (full-panel/fat-half/fat-quarter/fat-8/fat-9/fat-12/fat-16)
    fabric_type = sys.argv[15] # Fabric type (14aida/16aida/18aida/28evenweave/32evenweave/36evenweave/28linen/32linen/36linen/40linen)
    try:
        client_link = sys.argv[16]
    except:
        client_link = ''
else:
    try:
        client_link = sys.argv[14]
    except:
        client_link = ''


''' Time Initialistaion '''
startTime = datetime.now()
logging.info('Generation for {} started at {}'.format(fabric_name ,startTime))


''' Create fabric result diretory before generation '''
try:
    os.makedirs(path2+fabric_name.replace(' ', '_'))
except FileExistsError:
    pass
except PermissionError:
    logging.info("Couldn't create directories. Check your folder permissions.")
    exit()

''' Global variables '''
LOGO_LOCATION = path1 + "logoF_110.png"
HAND_ICON_LOCATION = path1 + "handIcon_80.png"
CMYK_LOCATION = path1 + "cmyk.png"
FONT_LOCATION = path1 + "cour.ttf"
CLIENT_LINK = client_link if len(client_link) != 0 else '' # < 20 characters
FABRIC_ID = "#"+str(fabric_id)
SEAMLESS = False if seamless == 0 else True
INCHES = inches * 150 # 150 DPI (Pixels per Inche)
CLEANED = False

''' Change templates colors to custom color '''
randomTemplateString = randomString()
setTempColor('42', background_color, path1, HEADER, randomTemplateString, seamless)
setTempColor('56', background_color, path1, HEADER, randomTemplateString, seamless)

''' Seamless compatibility '''
if seamless:
    template_type = "-template_seamless.jpg"
    WIDTH = SEAMLESS_WIDTH
else:
    template_type = "-template.jpg"
    WIDTH = NORMAL_WIDTH

''' Split name to two string if long '''
if len(fabric_name) > 22:
    fabric_name_1, fabric_name_2 = returnLines(fabric_name)


''' Open the fabric file + convert it for later manipulation. '''
fabric = Image.open(path3 + fabric_masterfile+'.'+fabric_extension)
fabric_mode = fabric.mode
logging.info("Image mode: {}".format(fabric.mode))

convert_mode = "RGBA"
logging.info("Convert mode: {}".format(convert_mode))

fabric = Image.open(path3 + fabric_masterfile+'.'+fabric_extension).convert(convert_mode)

''' Rotate image to landscape if set '''
if landscape == 1:
    fabric = fabric.rotate(90, expand=1)

''' Open template objects for later manipulation. '''
cmyk = Image.open(CMYK_LOCATION).convert(convert_mode)
logo = Image.open(LOGO_LOCATION)
handIcon = Image.open(HAND_ICON_LOCATION)
font = ImageFont.truetype(FONT_LOCATION, FONT_SIZE)

''' Generates one image and saves it '''
def generate(cut_type, choice, fabric_type):
    ''' Based on the size choice, select a template. '''
    template = Image.open(path1 + str(choice)+'-'+ randomTemplateString +template_type).convert(convert_mode)
    
    ''' Saving metadata from template to result file '''
    ''' Exif Loaded to readable format '''
    exif_dict = piexif.load(template.info.get('exif'))
    ''' ICC Profile '''
    if (fabric_mode != "CMYK"):
        icc_profile = template.info.get('icc_profile')
    else:
        logging.warn(template.info.get('icc_profile'))
        logging.warn(str(io.BytesIO(template.info.get('icc_profile'))))
        logging.warn(io.BytesIO(template.info.get('icc_profile')))
        #icc_profile = ImageCms.getOpenProfile(str(pathlib.Path().resolve())+'/GenericCMYKProfile.icc')
        icc_profile = ImageCms.ImageCmsProfile(io.BytesIO(fabric.info.get('icc_profile')))
       
    ''' Changes "Program name" attribute '''
    exif_dict["0th"][305] = GENERATOR_NAME
    ''' Resets thumbnail to later get automatically generated '''
    exif_dict.pop('thumbnail', None)
    ''' Dumped to bytes '''
    exif_bytes = piexif.dump(exif_dict)

    ''' Draw variable. '''
    draw = ImageDraw.Draw(template)

    ''' Upper stamp '''
    
    ''' Stamp seperator. '''
    draw.text((SEP1, 23), "|", font=font, fill=TEXT_COLOR)
    draw.text((SEP2, 23), "|", font=font, fill=TEXT_COLOR)
    draw.text((SEP1, 35), "|", font=font, fill=TEXT_COLOR)
    draw.text((SEP2, 35), "|", font=font, fill=TEXT_COLOR)
    ''' Safety spray '''
    draw.text((5453, -10), "|", font=font, fill=TEXT_COLOR)

    ''' Left section '''
    ''' Pasting icons. '''
    template.paste(cmyk, (CMYK_X, CMYK_Y), cmyk)
    template.paste(logo, (LOGO_X, LOGO_Y), logo)
    template.paste(handIcon, (HAND_X,HAND_Y), handIcon)
    ''' Website stamp. '''
    draw.text((HAND_X-len(WEBSITE_LINK)*CHAR_WIDTH-25, LINE1_Y), WEBSITE_LINK , font=font, fill=TEXT_COLOR)
    ''' Fabric ID stamp '''
    draw.text((HAND_X-len(FABRIC_ID)*CHAR_WIDTH-25, LINE2_Y), FABRIC_ID , font=font, fill=TEXT_COLOR)
    ''' Fabric name '''
    if len(fabric_name) > 22:
        draw.text((NAME_X, LINE1_Y), fabric_name_1, font=font, fill=TEXT_COLOR)
        draw.text((NAME_X, LINE2_Y), fabric_name_2, font=font, fill=TEXT_COLOR)
    else:
        draw.text((NAME_X, LINE_Y), fabric_name, font=font, fill=TEXT_COLOR)
    ''' Client link if provided '''
    ''' Fabric type '''
    fabric_type_name = returnFabricTypeName(fabric_type).replace('-', ' ')
    if len(CLIENT_LINK) != 0:
        draw.text((HALF_WIDH-(len(fabric_type_name)*CHAR_WIDTH)-75, LINE1_Y), fabric_type_name, font=font, fill=TEXT_COLOR)
        draw.text((HALF_WIDH-(len(CLIENT_LINK)*CHAR_WIDTH)-62, LINE2_Y), CLIENT_LINK, font=font, fill=TEXT_COLOR)
    else:
        draw.text((HALF_WIDH-(len(fabric_type_name)*CHAR_WIDTH)-35, LINE_Y), fabric_type_name, font=font, fill=TEXT_COLOR)


    ''' Right section '''
    fabric_type_name = returnFabricTypeName(fabric_type).replace('-', ' ')
    if len(CLIENT_LINK) != 0:
        draw.text((HALF_WIDH+80, LINE1_Y), fabric_type_name, font=font, fill=TEXT_COLOR)
        draw.text((HALF_WIDH+80, LINE2_Y), CLIENT_LINK, font=font, fill=TEXT_COLOR)
    else:
        draw.text((HALF_WIDH+80, LINE_Y), fabric_type_name, font=font, fill=TEXT_COLOR)

    template.paste(logo, (WIDTH-LOGO_X-100, LOGO_Y), logo)
    template.paste(handIcon, (WIDTH-HAND_X-85,HAND_Y), handIcon)
    draw.text((WIDTH-HAND_X+60, LINE1_Y), WEBSITE_LINK, font=font, fill=TEXT_COLOR)
    draw.text((WIDTH-HAND_X+60, LINE2_Y), FABRIC_ID , font=font, fill=TEXT_COLOR)
    if len(fabric_name) > 22:
        draw.text((WIDTH-LOGO_X-125-(len(fabric_name_1)*CHAR_WIDTH), LINE1_Y), fabric_name_1, font=font, fill=TEXT_COLOR)
        draw.text((WIDTH-LOGO_X-125-(len(fabric_name_2)*CHAR_WIDTH), LINE2_Y), fabric_name_2, font=font, fill=TEXT_COLOR)
    else:
        draw.text((WIDTH-LOGO_X-125-(len(fabric_name)*CHAR_WIDTH), LINE_Y), fabric_name, font=font, fill=TEXT_COLOR)

    ''' Lower stamp '''
    uppper_stamp = template.crop((0,0,WIDTH,150)).convert(convert_mode).rotate(180)
    template.paste(uppper_stamp, (0, 8250), uppper_stamp) if choice == 56 else template.paste(uppper_stamp, (0, 6150), uppper_stamp)

    ''' Resizing and pasting fabric '''
    indx = 0
    for fabPart in returnFabricParts(cut_type, choice, SEAMLESS, INCHES, HEADER):
        indx += 1
        if (keep_ratio):
            '''specialFabric = fillColor.resize(fabPart.size)
            template.paste(specialFabric, fabPart.location, specialFabric)'''

            ''' Resize image with keeping ratio and pasting it on the space filler ''' 
            ''' Get new sizes and locations '''
            #x = fabPart.location[0]
            #y = fabPart.location[1]
            #nx = x
            #ny = y

            w = fabPart.size[0]
            h = fabPart.size[1]

            x = fabPart.location[0]
            y = fabPart.location[1]

            if cut_type == 'fat-half' or cut_type == 'fat-8':
                nw, nh = getNewSizes(fabric.size[1],fabric.size[0], w, h)
            else:                
                nw, nh = getNewSizes(fabric.size[0],fabric.size[1], w, h)


            ny = y + ((h - nh) // 2)
            nx = x + ((w - nw) // 2)

            newLocation = (int(nx),int(ny))
            specialSize = (int(nw),int(nh))

            '''nw = w
            nh = h
            m = min(w,h)
            if m == w:
                nh = nw * (fabric.size[1] / fabric.size[0])
                ny = y + ((h - nh)//2)
            else:
                nw = nh * (fabric.size[0] / fabric.size[1])
                nx = x + ((w - nw)//2)

            newLocation = (int(nx),int(ny))
            specialSize = (int(nw),int(nh))'''

            logging.info('ol: {}, os: {}'.format((x,y), (w,h)))

            logging.info('M1# nl: {}, ns: {}'.format(newLocation, specialSize))
            

            '''fabricSize = fabric.resize(specialSize)
            template.paste(fabricSize, newLocation, fabricSize)'''

            template = drawParts(template, fabric, cut_type, indx, newLocation, specialSize)
        else:
            '''fabricSize = fabric.resize(fabPart.size)
            template.paste(fabricSize, fabPart.location, fabricSize)'''

            template = drawParts(template, fabric, cut_type, indx, fabPart.location, fabPart.size)


    ''' Create image final structured name '''
    file_name = fabric_name.replace(' ', '_')+"-"+cut_type+"-"+returnFabricTypeName(fabric_type)+"-36x"+str(choice)+".jpg"

    ''' Generate preview images in lower quality to save storage sapce '''
    if 'previews' in path2:
        LINEN_TEXTURE = Image.open(path3+"/preview_generator/linen_full.png")
        template = template.resize((1024, 1024),Image.ANTIALIAS)
        #template.paste(LINEN_TEXTURE, (0, 0), LINEN_TEXTURE)
        
        quality_value = 60
    else:
        quality_value = 100
    
    ''' Finally save the image as JPEG '''
    
    if (fabric_mode != "CMYK"):
        template.convert(fabric_mode).save(path2 + fabric_name.replace(' ', '_')+'/'+file_name, "JPEG", dpi=(150,150), exif=exif_bytes, quality=quality_value, icc_profile=icc_profile, optimize=False)
    else:
        template = ImageCms.profileToProfile(template, icc_profile, str(pathlib.Path().resolve())+'/processor/sRGBColorSpaceProfile.icm', renderingIntent=0, outputMode='RGB')
        template.save(path2 + fabric_name.replace(' ', '_')+'/'+file_name, "JPEG", dpi=(150,150), exif=exif_bytes, quality=quality_value, optimize=False)

''' Generate all variations or one specific '''
if sys.argv[13] == 'all':
    logging.info('Generating all variations')
    for cut_type in CUT_TYPES:
        for choice in CHOICES:
            for fabric_type in FABRIC_TYPES:
                generate(cut_type, choice, fabric_type)
else:
    try:
        generate(cut_type, choice, fabric_type)
    except Exception as e:
        logging.error(traceback.format_exc())
        logging.info("Script stopped with an error, cleaning...")
        os.remove(path1 + '42-'+ randomTemplateString + template_type)
        os.remove(path1 + '56-'+ randomTemplateString + template_type) 
        CLEANED = True

''' Script finished execution '''
if CLEANED == False:
    logging.info("Generation completed, took {}".format(datetime.now() - startTime))
    logging.info("Cleaning...")
    os.remove(path1 + '42-'+ randomTemplateString + template_type)
    os.remove(path1 + '56-'+ randomTemplateString + template_type)
else:
    logging.info("Generation failed, please check the error log.")