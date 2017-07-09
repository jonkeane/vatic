#! /usr/bin/bash

# Usage: load-videos.sh -o [directory to place frame images] -t [training clip name] -a [video file(s) to load in to vatic]
# Eg: load-videos.sh -o /var/videos/frames/test/ /var/videos/1minClips/*
#
# This script will replace all spaces and parens with underscores in filenames (so that ffmpeg has an easier time digesting them), create folders for the frames to sit in, use turkic to extract frames, and then publish each video as a task for fingerspelling annotation
# the -t [training clip name] and -a arguments are optional:
# -t associates a file with a specific training clip
# -a publishes the video on AWS MTurk (leaving it off defaults to offline publishing)

offline="--offline"
training=""

while getopts ":o:t:a" opt; do
  case $opt in
    o)
      output="${OPTARG}"
      ;;
    a)
      offline=""
    ;;
    t)
      training="--train-with ${OPTARG}"
    ;;
    \?) echo "Invalid option -$OPTARG" >&2
    ;;
  esac
done

# grab the videos at the end
shift $(($OPTIND-1))
files=("${@}")

echo "Found "${#files[@]}" videos to process"

# for debugging options
# echo "$offline"
# echo "$training"
# echo "${files[@]}"
# exit 1

# rename all files, to replace spaces with underscores
echo "Renaming all videos with spaces in the title"
for file in "${files[@]}"
do
  newfile=${file// /_}
  newfile=${newfile// /_}
  newfile=${newfile//\(/_}
  newfile=${newfile//\)/_}
  mv "$file" "$newfile"
done


# two types of spaces that show up
files=( "${files[@]// /_}" )
files=( "${files[@]// /_}" )
files=( "${files[@]//(/_}" )
files=( "${files[@]//)/_}" )
# for each of the files, make a directory to contain the frames
echo "Making directories for each of the videos."
for file in "${files[@]}"
do
  # echo "/n"
  b=$(basename "$file")
  mkdir -p "$output$b"
done


echo "Extracting images for each of the videos."
# for each of the files, exract the frames
for file in "${files[@]}"
do
  b=$(basename "$file")
  turkic extract "$file" "$output$b"
done

echo "Loading each of the videos to turkic."
if [ "$offline" == "--offline" ]
then
  echo "(Currently using --offline option. This should be removed if the hits are to be run on AWS.)"
fi
# for each of the files, exract the frames
for file in "${files[@]}"
do
  b=$(basename "$file")
  CMD="turkic load $b $output$b '' ~Start ~End $training $offline"
  eval "$CMD"
done

echo "Publishing the videos."
if [ "$offline" == "--offline" ]
then
  echo "(Again, using --offline option. This should be removed if the hits are to be run on AWS.)"
  turkic publish --offline
else
  turkic publish
fi
