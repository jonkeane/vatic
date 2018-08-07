#! /usr/bin/python
# python compareAnnotators.py path/to/folder/ path/to/folder/ --output annotator_distance.csv

# Each folder should have all and only the elan files to compare against each
# other. If the names are too different within a folder, a warning will be
# issued.

import sys, re, os, itertools, collections, imp, warnings, csv, argparse
import pyelan
from pyelan.distance import *

# ensure that sklearn is available
try:
    imp.find_module('sklearn')
    from sklearn import metrics
    sklearn_avail = True
except ImportError:
    print("You must install scikit-learn before running this script.")
    raise

if __name__ == '__main__':

    parser = argparse.ArgumentParser()

    parser.add_argument("files", nargs="*")
    parser.add_argument("--output", help="File to save the output", default = "annotator_distance.csv")
    args = parser.parse_args()

    folders = args.files

    # set a limit to warn users about filenames being over
    lev_dist_limit = 0.7

    # grab all elan files recursively in each directory given
    elan_files = {folder: [] for folder in folders}
    # for each folder, find elan files recursively
    for folder in folders:
        for root, dirs, files in os.walk(folder):
            for name in files:
                relFile = os.path.join(root, name)
                if name.endswith((".eaf")):
                    elan_files[folder].append(relFile)

    # check that all of the files in each directory are reasonably similar (here
    # reasonable is set by lev_dist_limit above)
    for folder in elan_files.keys():
        # use keys to iterate over so that we don't accidentally manipulate elan_files
        files = list(elan_files[folder])
        if len(files) > 1:
            ref_file = files.pop(0)
            scores = []
            for comp_file in files:
                ref = os.path.basename(ref_file)
                comp = os.path.basename(comp_file)
                n_char = float(max(len(ref), len(comp)))
                scores.append(levenshtein(ref, comp)/n_char)
            if max(scores) > lev_dist_limit:
                files_out = files
                files_out.append(ref_file)
                warn_text = """
    The filenames in the folder {0} differ substantially. Please check that they all reference the same clip. Files found:
    {1}
                """
                warnings.warn(warn_text.format(folder, ",\n".join(files_out)))

    # score each folder
    scores_out = []
    for folder, files in elan_files.iteritems():
        scores_out.extend(pyelan.compare_files(files, frame_min = 0, frame_max = 1800))

    # write scores out in a csv
    with open(args.output,'wb') as fou:
        fldnames = ['gs_file', 'comparison_file', 'gs_tier', 'comparison_tier',  'total_levenshtein', 'time_diff_sum', 'frame_diff_sum', 'overlapping_levenshtein', 'cohens_kappa']
        dw = csv.DictWriter(fou, fieldnames=fldnames)
        headers = {}
        for n in dw.fieldnames:
            headers[n] = n
        dw.writerow(headers)
        for row in scores_out:
            dw.writerow(row)
