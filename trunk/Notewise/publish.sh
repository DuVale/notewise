#! /bin/sh

cd mod_perl/
svn up -rHEAD
echo "updating prereqs"
perl Makefile.PL
sudo make
perl compilejs.pl
echo "Restarting apache"
sudo service httpd restart
