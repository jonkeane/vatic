#! /bin/bash

# dump the annotatoins for all completed videos to a folder, one file per video.
# Usage:
# dump-all.sh folder
# dump-all.sh --json folder
# dump-all.sh --text folder
# dump-all.sh --xml folder

files=($(turkic list --completed | awk 'NR>1 {print $1}'))

# uniqify
files=($(printf "%s\n" "${files[@]}" | sort -u))

if [[ $1 == \-\-* ]];
then
    opt=$1
    folder=$2
else
    opt=''
    folder=$1
fi

ext='.txt'
case $opt in
\-\-json)
    ext='.json'
;;
\-\-xml)
    ext='.xml'
;;
\-\-matlab)
    ext='.matlab'
;;
esac 

for file in "${files[@]}"
do
    fileout=$folder'/'$file$ext
    echo 'writing '$fileout
    turkic dump $opt $file -o $fileout
done
