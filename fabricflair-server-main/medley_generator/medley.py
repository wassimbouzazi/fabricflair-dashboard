# -*- coding: utf-8 -*-
#import ^packages
import cv2
import sys
import os

# Arguments
path1 = sys.argv[1]
path2 = sys.argv[2]
path3 = sys.argv[3]
path4 = sys.argv[4]
pixel_arg = sys.argv[5]
cut = sys.argv[6]
folder_name = sys.argv[7] # This is required to create a folder for generated files.

# final sizes
f_size = (2700,4050)
f2_size = (5400,8100)

# final preview sizes
f_preview_size = (270,405)
f2_preview_size = (540,810)

p1_size = (2700,2025)
p2_size = (1350,2025)

q1_size = (5400,4050)
q2_size = (2700,4050)


#border color
white = [255,255,255]

def get_concat_4_v(im_1,im_2,im_3,im_4,pixel_param):
    pxl = int(pixel_param) * 150

    cut_options_list = cut.split(',')
    height_1, width_1, channels = im_1.shape
    height_2, width_2, channels = im_2.shape
    height_3, width_3, channels = im_3.shape
    height_4, width_4, channels = im_4.shape
    
    if cut_options_list[0] == '1':
        im_1 = im_1[0:(height_1//2), 0:(width_1//2)]
    
    if cut_options_list[1] == '1':
        im_2 = im_2[0:(height_2//2), 0:(width_2//2)]
    
    if cut_options_list[2] == '1':
        im_3 = im_3[0:(height_3//2), 0:(width_3//2)]
    
    if cut_options_list[3] == '1':
        im_4 = im_4[0:(height_4//2), 0:(width_4//2)]

    im_list = [im_1,im_2,im_3,im_4]

    #27x36 SET UP
    im_list_resize_27x36 = [cv2.resize(im, p2_size) for im in im_list]

    img_with_border_27x36 = [cv2.copyMakeBorder(im,pxl,pxl,pxl,pxl, \
                                         cv2.BORDER_CONSTANT,value=white) for im in im_list_resize_27x36]
    output_1_27x36 = cv2.hconcat(img_with_border_27x36[0:2])
    output_2_27x36 = cv2.hconcat(img_with_border_27x36[2:4])
    img_27x36 = cv2.vconcat([output_1_27x36, output_2_27x36])
    output_27x36 = cv2.resize(img_27x36, f_size)
    preview_output_27x36 = cv2.resize(img_27x36, f_preview_size)

    #36x54 SET UP
    im_list_resize_36x54 = [cv2.resize(im, q2_size) for im in im_list]
    img_with_border_36x54 = [cv2.copyMakeBorder(im,pxl,pxl,pxl,pxl, \
                                         cv2.BORDER_CONSTANT,value=white) for im in im_list_resize_36x54]
    output_1_36x54 = cv2.hconcat(img_with_border_36x54[0:2])
    output_2_36x54 = cv2.hconcat(img_with_border_36x54[2:4])
    img_36x54 = cv2.vconcat([output_1_36x54, output_2_36x54])
    output_36x54 = cv2.resize(img_36x54, f2_size)
    preview_output_36x54 = cv2.resize(img_36x54, f2_preview_size)


    #36x54 FAT QUARTER SET UP

    quarter_output_1_36x54 = cv2.hconcat([output_27x36, output_27x36])
    quarter_output_2_36x54 = cv2.hconcat([output_27x36, output_27x36])
    quarter_img_36x54 = cv2.vconcat([quarter_output_1_36x54, quarter_output_2_36x54])
    quarter_img_36x54_preview = cv2.resize(quarter_img_36x54, f2_preview_size)

    try : 
        # CREATE FOLDER
        os.makedirs(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'originals'))) 
        os.makedirs(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'previews')))
        cv2.imwrite(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'originals',folder_name+"_27x36.jpg")),output_27x36)
        cv2.imwrite(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'previews',folder_name+"_27x36.jpg")),preview_output_27x36)       
        cv2.imwrite(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'originals',folder_name+"_36x54.jpg")),output_36x54)
        cv2.imwrite(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'previews',folder_name+"_36x54.jpg")),preview_output_36x54)
        cv2.imwrite(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'originals',folder_name+"_quarter_36x54.jpg")),quarter_img_36x54)
        cv2.imwrite(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'previews',folder_name+"_quarter_36x54.jpg")),quarter_img_36x54_preview)  
        print('Medley generated')
    except : 
        print('Error')
        
def get_concat_2_v(img_1,img_2,pixel_param):

    pxl = int(pixel_param) * 150
    cut_options_list = cut.split(',')
    height_1, width_1, channels = img_1.shape
    height_2, width_2, channels = img_2.shape
    
    if cut_options_list[0] == '1':
        img_1 = img_1[0:(height_1//2), 0:(width_1)]
    
    if cut_options_list[1] == '1':
        img_2 = img_2[0:(height_2//2), 0:(width_2)]


    im_list = [img_1,img_2]


    #27x36 SET UP
    im_list_resize_27x36 = [cv2.resize(im, p1_size) for im in im_list]
    img_with_border_27x36 = [cv2.copyMakeBorder(im,pxl,pxl,pxl,pxl, \
                                         cv2.BORDER_CONSTANT,value=white) for im in im_list_resize_27x36]
    img_27x36 = cv2.vconcat(img_with_border_27x36)
    output_27x36 = cv2.resize(img_27x36, f_size)
    preview_output_27x36 = cv2.resize(img_27x36, f_preview_size)


    #36x54 SET UP

    im_list_resize_36x54 = [cv2.resize(im, q1_size) for im in im_list]
    img_with_border_36x54 = [cv2.copyMakeBorder(im,pxl,pxl,pxl,pxl, \
                                         cv2.BORDER_CONSTANT,value=white) for im in im_list_resize_36x54]
    img_36x54 = cv2.vconcat(img_with_border_36x54)
    output_36x54 = cv2.resize(img_36x54, f2_size)
    preview_output_36x54 = cv2.resize(img_36x54, f2_preview_size)


    

    try : 
        # CREATE FOLDER
        os.makedirs(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'originals'))) 
        os.makedirs(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'previews')))
        cv2.imwrite(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'originals',folder_name+"_27x36.jpg")),output_27x36)
        cv2.imwrite(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'previews',folder_name+"_27x36.jpg")),preview_output_27x36)       
        cv2.imwrite(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'originals',folder_name+"_36x54.jpg")),output_36x54)
        cv2.imwrite(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'medleys/',folder_name,'previews',folder_name+"_36x54.jpg")),preview_output_36x54) 
        print('Medley generated')
    except : 
        print('Error')
        

if (path3 in ['Null','NULL','null'] and path4 in ['Null','NULL','null']) : 
    img1 = cv2.imread(path1) 
    img2 = cv2.imread(path2)
    get_concat_2_v(img1,img2,pixel_arg)
else : 
    img1 = cv2.imread(path1) 
    img2 = cv2.imread(path2)
    img3 = cv2.imread(path3)
    img4 = cv2.imread(path4)
    get_concat_4_v(img1,img2,img3,img4,pixel_arg)
