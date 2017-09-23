#! /usr/local/bin/python
# ./parse-annotations.py path/to/output/folder path/to/vatic-dump

import csv, sys, os

def parse_one_file(fl, dest_path):
    annos = []
    label_up = ""
    attr_up = ""
    
    # filenames
    old_file = fl
    new_file = os.path.basename(old_file) 
    new_file = os.path.splitext(new_file)[0] + ".csv"
    new_file = os.path.join(dest_path, new_file)

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
                anno = {"label": label_up, "startframe": None, "endframe": None}
                
            if attr_up != line[10]:
                # we've got a new label
                frame = int(line[5])
                attr_up = line[10]
                if attr_up == "Start":
                    anno["startframe"] = frame
                if attr_up == "End":
                    anno["endframe"] = frame
                    annos.append(anno)
            # ensure there are no surprises    
            if frame < anno["startframe"]:
                raise Exception('There is a misordering of start frame annotations')
            if frame < anno["endframe"]:
                raise Exception('There is a misordering of end frame annotations')

    if len(annos) > 0:
        # only if there are annotations, write a csv
        with open(new_file, 'wb') as output_file:
            dict_writer = csv.DictWriter(output_file, annos[0].keys(), quoting=csv.QUOTE_NONNUMERIC)
            dict_writer.writeheader()
            dict_writer.writerows(annos)
        
        
dest_path = sys.argv[1]
files = sys.argv[2:]
for fl in files:
    print("Working on file: "+fl)
    parse_one_file(fl, dest_path)
