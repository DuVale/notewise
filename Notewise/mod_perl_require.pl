#!/usr/bin/perl

print "\n\n\n";
BEGIN {
  our $dir = "/var/www/notewise/Notewise";
}
use lib ("$dir/blib/lib", "$dir/blib/arch", "$dir/DBD-mysql/blib/lib", "$dir/DBD-mysql/blib/arch");
#use PAR 'par_files/*.par';

#use Catalyst;
use Notewise;
use DBD::mysql;

1;
