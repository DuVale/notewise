#! /bin/bash

SYMLINK=/var/www/staging.notewise.com
CONFIG=/var/www/configs/staging-config.yml

# figure out where we should be pushing to

LIVE_DIRECTORY_NUM=`ls -ld $SYMLINK | perl -pe 's/.*-> \S+(\d+).*/\1/'`
NEXT_DIRECTORY_NUM=$(( $LIVE_DIRECTORY_NUM + 1 ))

if (( $NEXT_DIRECTORY_NUM > 2 ));
then
    NEXT_DIRECTORY_NUM=0
fi

NEXT_DIRECTORY="$SYMLINK.$NEXT_DIRECTORY_NUM"

echo "NEXT_DIRECTORY: $NEXT_DIRECTORY"

# unpack par files (to save on startup costs)
#scripts/unpack.sh

# rsync everything over

sudo rm -rf $NEXT_DIRECTORY/*
rsync -rl --delete --exclude '.svn' --exclude 'root/test' --exclude 'root/jsunit' --include 'root/js/javascript-min.js' --exclude 'root/js/*' blib par_files root html $NEXT_DIRECTORY

# create cached templates directory

mkdir -p $NEXT_DIRECTORY/cached_templates/var/www/staging.notewise.com/root/base
chmod -R 777 $NEXT_DIRECTORY/cached_templates 2> /dev/null

# copy config
rm -rf $NEXT_DIRECTORY/config/
mkdir $NEXT_DIRECTORY/config/
cp $CONFIG $NEXT_DIRECTORY/config/config.yml

# move the sym link

rm $SYMLINK && ln -s $NEXT_DIRECTORY $SYMLINK

echo "Updated symlink $SYMLINK to point to $NEXT_DIRECTORY"

# restart apache

echo "Restarting apache"
sudo service httpd-staging restart
