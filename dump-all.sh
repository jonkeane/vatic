#! /bin/bash

# dump the annotatoins for all completed videos to a folder, one file per video.
# Usage:
# dump-all.sh folder

files=($(turkic list --completed | awk '{print $1}'))

echo $files

for file in "${files[@]}"
do
    ext='.txt'
    folder=$1
    fileout=$folder'/'$file$ext
    echo 'writing '$fileout
    turkic dump $file -o $fileout
done
