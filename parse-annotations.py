#! /usr/bin/python
# ./parse-annotations.py --output_dir path/to/output/folder path/to/vatic-dump
# to make elan files, add the options: --make_elan --videos_location ../path/to/video/files/


import csv, sys, os, re, argparse, shutil, tempfile, json, pandas
import pyelan.pyelan as pyelan

from itertools import izip

def grouped(iterable, n):
    "s -> (s0,s1,s2,...sn-1), (sn,sn+1,sn+2,...s2n-1), (s2n,s2n+1,s2n+2,...s3n-1), ..."
    return izip(*[iter(iterable)]*n)

def parse_one_file(fl, dest_path):
    """
    fl file to parse
    dest_path the path to write the new csv to

    """
    # filenames
    old_file = fl
    base_file = os.path.basename(old_file)
    base_file = os.path.splitext(base_file)[0]
    new_file = base_file + ".csv"
    new_file = os.path.join(dest_path, new_file)

    if os.path.splitext(old_file)[1] == '.txt':
        annos = parse_text(old_file)
    elif os.path.splitext(old_file)[1] == '.json':
        annos = parse_json(old_file)
    else:
        raise Exception('Unknown file format on:'+old_file)

    if len(annos) > 0:
        # only if there are annotations, write a csv
        with open(new_file, 'wb') as output_file:
            dict_writer = csv.DictWriter(output_file, annos[0].keys(), quoting=csv.QUOTE_NONNUMERIC)
            dict_writer.writeheader()
            dict_writer.writerows(annos)
        print("Wrote the csv file: " + new_file)
    else:
        # write an empty file
        open(new_file, 'a').close()
    return(annos, base_file)

def parse_text(filename):
    annos = []
    label_up = ""
    attr_up = ""
    anno = {"label": None, "worker_id": None, "hit_id": None,
    "assignment_id": None, "startframe": None, "endframe": None}
    with open(filename) as ssv:
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
            # 11  workerid. The MTurk workerid
            # 12  hitid. The hit id number (this should be the same for each video,
            #     though sometimes might be different because of the training clip substitution)
            # 13  assignmentid. The assignment id (this should be different for each worker)
            # 14+ attributes. Each column after this is an attribute.
            if len(line) == 13:
                # there is no annotation here.
                continue

            if label_up != line[9]:
                # we've got a new label, move on
                label_up = line[9]
                anno["label"] = label_up
                worker_id = line[10]
                anno["worker_id"] = worker_id
                hit_id = line[11]
                anno["hit_id"] = hit_id
                assignment_id = line[12]
                anno["assignment_id"] = assignment_id

            if attr_up != line[13]:
                # we've got a new label
                frame = int(line[5])
                attr_up = line[13]
                if attr_up == "Start":
                    anno["startframe"] = frame
                if attr_up == "End":
                    anno["endframe"] = frame
                if anno["startframe"] is not None and anno["endframe"] is not None:
                    # if anno is full, move on
                    annos.append(anno)
                    anno = {"label": label_up, "worker_id": worker_id,
                    "hit_id": hit_id, "assignment_id": assignment_id,
                    "startframe": None,
                    "endframe": None}
            # ensure there are no surprises
            if attr_up == "Start" and frame < anno["startframe"]:
                raise Exception('There is a misordering of start frame annotations')
            if attr_up == "End" and frame < anno["endframe"]:
                raise Exception('There is a misordering of end frame annotations')
    return(annos)


def parse_json(filename):
    json_data=open(filename).read()
    data = json.loads(json_data)

    annos = []
    label_up = ""
    attr_up = ""
    for i in data:
        label_data = data[i]
        label = label_data['label']
        worker_id = label_data['workers']
        hit_id = label_data['hitid']
        assignment_id = label_data['assignmentid']
        startframe = None
        endframe = None

        anno_data = label_data['boxes']
        attribs = [{"frame": x, "anno": anno_data[x]['attributes']} for x in anno_data]
        strt_end = set([x["anno"][0] for x in attribs if x["anno"] != []])
        if strt_end != set([u'End']) and strt_end != set([u'Start']):
            raise Exception('There is something wrong with these attributes')
        strt_end = strt_end.pop()
        frames_annoed = [int(x["frame"]) for x in attribs if x["anno"] == [strt_end]]
        first_frame = min(frames_annoed)

        if strt_end == "Start":
            startframe = first_frame
        elif strt_end == "End":
            endframe = first_frame

        annos.append({
        "label": label,
        "worker_id": worker_id,
        "hit_id": hit_id,
        "assignment_id": assignment_id,
        "startframe": startframe,
        "endframe": endframe,
        "first_frame": first_frame})

    hitassignments = [[x["worker_id"], x["hit_id"], x["assignment_id"]] for x in annos]
    hitassignments = set(tuple(row) for row in hitassignments)

    new_annos = []
    # separate by worker/hit/assignment
    for worker, hit, assignment in hitassignments:
        sub_annos = [x for x in annos if x["worker_id"] == worker and
        x["hit_id"] == hit and x["assignment_id"] == assignment]

        # order by first frame, since labels cannot overlap / span each other
        sub_annos.sort(key=lambda x: x['first_frame'])

        for start, end in grouped(sub_annos, 2):
            if start['endframe'] is not None and end['startframe'] is not None:
                # a weird case where the start and stop are the same frame, and 
                # were accidently misordered, flip and continue
                start_new = end
                end_new = start
                start = start_new
                end = end_new

            if start['endframe'] is not None or end['startframe'] is not None:
                raise Exception('There is an error attempting to chunk annotations.')

            new_anno = start
            new_anno['endframe'] = end['endframe']
            del(new_anno['first_frame'])

            new_annos.append(new_anno)
    return(new_annos)

if __name__ == '__main__':
    """
    The main loop that runs when you run the script
    """
    # parse arguments
    parser = argparse.ArgumentParser(description='Process json output from vatic.')
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

        if args.make_elan:
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

            # create elan annotations per annotation found by tier for worker
            hitassignments = [[x["worker_id"], x["hit_id"], x["assignment_id"]] for x in annos]
            hitassignments = set(tuple(row) for row in hitassignments)

            tiers_to_add = []
            for worker, hit, assignment in hitassignments:
                sub_annos = [x for x in annos if x["worker_id"] == worker and
                x["hit_id"] == hit and x["assignment_id"] == assignment]

                annos_to_add = []
                for anno in sub_annos:
                    annos_to_add.append(pyelan.annotation(
                        begin=int(round(anno["startframe"]*33.3667)), # convert from frames to milliseconds
                        end=int(round(anno["endframe"]*33.3667)), # convert from frames to milliseconds
                        value=anno["label"])
                        )
                tier_label = 'wrkr:'+worker+" hit:"+hit+" assign:"+assignment
                tiers_to_add.append(pyelan.tier(tier_label, annos_to_add))

            # make tiers and write the elan file
            allTiers = pyelan.tierSet(media=vid_loc, tiers=tiers_to_add)
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
