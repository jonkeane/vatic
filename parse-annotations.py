#! /usr/bin/python
# ./parse-annotations.py --output_dir path/to/output/folder path/to/vatic-dump
# to make elan files, add the options: --make_elan --videos_location ../path/to/video/files/


import csv, sys, os, re, argparse, shutil, tempfile
import pyelan.pyelan as pyelan

def parse_one_file(fl, dest_path):
    """
    fl file to parse
    dest_path the path to write the new csv to
    
    """
    annos = []
    label_up = ""
    attr_up = ""
    
    # filenames
    old_file = fl
    base_file = os.path.basename(old_file) 
    base_file = os.path.splitext(base_file)[0]
    new_file = base_file + ".csv"
    new_file = os.path.join(dest_path, new_file)
    anno = {"label": None, "startframe": None, "endframe": None}

    with open(old_file) as ssv:
        for line in csv.reader(ssv, delimiter=" "): 
            # 10 means no annotation 11 means annotation
            # 1   Track ID. All rows with the same ID belong to the same path.
            # 2   xmin. The top left x-coordinate of the bounding box.
            # 3   ymin. The top left y-coordinate of the bounding box.
            # 4   xmax. The bottom right x-coordinate of the bounding box.
            # 5   ymax. The bottom right y-coordinate of the bounding box.
            # 6   frame. The frame that this annotation represents.
            # 7   lost. If 1, the annotation is outside of the view screen.
            # 8   occluded. If 1, the annotation is occluded.
            # 9   generated. If 1, the annotation was automatically interpolated.
            # 10  label. The label for this annotation, enclosed in quotation marks.
            # 11+ attributes. Each column after this is an attribute.
            if len(line) == 10:
                # there is no annotation here.
                continue
            
            if label_up != line[9]:
                # we've got a new label, move on
                label_up = line[9]
                anno["label"] = label_up
                
            if attr_up != line[10]:
                # we've got a new label
                frame = int(line[5])
                attr_up = line[10]
                if attr_up == "Start":
                    anno["startframe"] = frame
                if attr_up == "End":
                    anno["endframe"] = frame
                if anno["startframe"] is not None and anno["endframe"] is not None:
                    # if anno is full, move on
                    annos.append(anno)
                    anno = {"label": None, "startframe": None, "endframe": None}
                    label_up = ""
                    attr_up = ""
            # ensure there are no surprises    
            if attr_up == "Start" and frame < anno["startframe"]:
                raise Exception('There is a misordering of start frame annotations')
            if attr_up == "End" and frame < anno["endframe"]:
                raise Exception('There is a misordering of end frame annotations')
            
    if len(annos) > 0:
        # only if there are annotations, write a csv
        with open(new_file, 'wb') as output_file:
            dict_writer = csv.DictWriter(output_file, annos[0].keys(), quoting=csv.QUOTE_NONNUMERIC)
            dict_writer.writeheader()
            dict_writer.writerows(annos)
        print("Wrote the csv file: " + new_file)
    return(annos, base_file)


if __name__ == '__main__':
    """
    The main loop that runs when you run the script
    """
    # parse arguments        
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('--output_dir', metavar='path-to-destination', help='Output directory')
    parser.add_argument('--make_elan', action='store_true', help='Make elan files')
    parser.add_argument('--videos_location', metavar='path-to-videos', help='Location of video files (only used when making elan files)')
    parser.add_argument('files', type=str, nargs='+', metavar='dump files to process', help='files')
    args = parser.parse_args()

    dest_path = args.output_dir
    files = args.files
    for fl in files:
        print("")
        print("Working on file: "+fl)
        annos, base_file = parse_one_file(fl, dest_path)
        
        if args.make_elan and len(annos) > 0:
            if args.videos_location is None:
                vids_loc = "./"
            else:
                vids_loc = args.videos_location
                
            vid_loc = []
            # find the appropriate video
            for dirpath, subdirs, files in os.walk(vids_loc, topdown=False, followlinks=False):
                for x in files:
                    if re.match(base_file, x):
                        vid_loc.append(os.path.join(dirpath, x))
                    
            # make temp dir for elan file and video
            temp_dir = os.path.join(tempfile.gettempdir(), base_file)
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            os.makedirs(temp_dir)
            
            # check if there is more than or less than one matching video
            if len(vid_loc) > 1:
                print("It looks like there is more than one video that matches this filename. Please try specifying a more specific location.")
            if len(vid_loc) < 1:
                print("There is no video that matches this filename. Creating an elan file, but the video will have to be manually linked.")
            else: 
                # copy the videos if it's the only one.
                old_vid_loc = vid_loc
                for vid in old_vid_loc:
                    vid_loc = [os.path.join(temp_dir, base_file)]
                    shutil.copyfile(vid, vid_loc[0])
                
            # create elan annotations per annotation found
            annos_to_add = []
            for anno in annos:
                annos_to_add.append(pyelan.annotation(
                    begin=int(round(anno["startframe"]*33.3667)), # convert from frames to milliseconds
                    end=int(round(anno["endframe"]*33.3667)), # convert from frames to milliseconds
                    value=anno["label"])
                    )
            
            # make tiers and write the elan file
            tiers_to_add = pyelan.tier("mturk annotation", annos_to_add)
            allTiers = pyelan.tierSet(media=vid_loc, tiers=[tiers_to_add])
            elanOut = os.path.join(temp_dir,'.'.join([base_file,"eaf"]))
            out = pyelan.tierSet.elanOut(allTiers, dest=elanOut)
            # replace the absolute path since it will be wrong
            try:
                out.getroot()[0][1].attrib["MEDIA_URL"] = "file://" + out.getroot()[0][1].attrib["RELATIVE_MEDIA_URL"]
            except:
                pass
            out.write(elanOut)
            
            # zip up the temp dir
            shutil.make_archive(os.path.join(dest_path, base_file), 'zip', temp_dir)
            
            shutil.rmtree(temp_dir)
            print("Wrote the elan file in the archive: " + os.path.join(dest_path, base_file) + ".zip")

                    

