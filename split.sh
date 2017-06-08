#! /bin/bash

# Usage: ./split file.avi
# Output: file_1.avi, file_2.avi,...

INPUT=$1
PATTERN="(.*)(\..*)"
if [[ $INPUT =~ $PATTERN ]]
then
    FILE_NAME=${BASH_REMATCH[1]}
    SUFFIX=${BASH_REMATCH[2]}
fi
DURATION=`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $INPUT | xargs printf "%.0f"`

START=0
while [ $START -lt $DURATION ]; do
    INTERV=60
    if [ `expr $START + 60` -gt $DURATION ]
    then
        INTERV=`expr $DURATION - $START`
    fi
    echo $START "/" $INTERV
    NF=$FILE_NAME"_"`expr $START / 50`$SUFFIX
    ffmpeg -i $INPUT -vcodec h264 -crf 18 -an -ss $START -t $INTERV $NF
    START=`expr $START + 50`
done
