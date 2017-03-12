# vatic
vatic is an online, interactive video annotation tool for computer vision research that crowdsources work to Amazon's Mechanical Turk. Our tool makes it easy to build massive, affordable video data sets. Written in Python + C + Javascript, vatic is free and open-source software.

This fork is based on modifications from [Sunil Bandla and Kristen Grauman's fork](http://vision.cs.utexas.edu/projects/active-untrimmed/) and further allows for a number of free-form annotations to be made.

## Additions
The team at TTI has written some helper bash scripts for chopping videos up into 1 minute segments (with 10 seconds of overlap), as well as a script that takes those videos, extracts the images as needed by vatic, and loads them into the database for annotation (with the correct metadata to be recognized as a fingerspelling task).

### `split.sh`
The usage for the splitting script `split.sh` is as follows:

```
./split.sh file.avi
```

This will result in files `file_1.avi, file_2.avi, ...`. This script should be run on any longer videos that need to be clipped into smaller chunks before they are loaded into vatic.

### `load-videos.sh`
The load videos script will make sure that the filenames are compatible with vatic, create individual folders for each video, extract individual frames into each folder, and then load each video as a HIT into vatic. The usage for `load-videos.sh` is as follows:

```
load-videos.sh -o [directory to place frame images] [video file(s) to load in to vatic]
```

This script will replace all spaces and parens with underscores in filenames (so that ffmpeg has an easier time digesting them), create folders for the frames to sit in, use turkic to extract frames, and then publish each video as a task for fingerspelling annotation. Once everything is loaded, the tasks are published, and everything should be good to go. Currently it is hardcoded for the tasks to be published in vatic's offline mode (to prevent accidental generation of accidental HITs on Amazon Mechanical Turk, simple remove `--offline` from the script when you want to publish to amazon directly.)