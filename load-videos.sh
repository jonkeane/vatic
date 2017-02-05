#! /usr/bin/bash

# Usage: load-videos.sh -o [directory to place frame images] [video file(s) to load in to vatic]
# Eg: load-videos.sh -o /var/videos/frames/test/ /var/videos/1minClips/*
#
# This script will replace all spaces and parens with underscores in filenames (so that ffmpeg has an easier time digesting them), create folders for the frames to sit in, use turkic to extract frames, and then publish each video as a task for fingerspelling annotation

files=("${@:3}")

echo "Found "${#files[@]}" videos to process"

while getopts ":o:" opt; do
  case $opt in
    o)
      output="${OPTARG}"
      ;;
    \?) echo "Invalid option -$OPTARG" >&2
    ;;
  esac
done

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

echo "Loading each of the videos to turkic. (Currently using --offline option. This hsould be removed if the hits are to be run on AWS.)"
# for each of the files, exract the frames
for file in "${files[@]}"
do
  b=$(basename "$file")
  turkic load "$b" "$output$b" '' ~Start ~End  --offline
done

echo "Publishing the videos. (Again, using --offline option. This hsould be removed if the hits are to be run on AWS.)"
turkic publish --offline
