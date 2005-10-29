#!/usr/bin/perl5.8.6 -w

eval 'exec /usr/bin/perl5.8.6 -w -S $0 ${1+"$@"}'
    if 0; # not running under some shell

use strict;
use Getopt::Long;
use Pod::Usage;
use Catalyst::Helper;

my $help = 0;
my $nonew = 0;

GetOptions( 'help|?' => \$help,
	    'nonew'  => \$nonew );

pod2usage(1) if ( $help || !$ARGV[0] );

my $helper = Catalyst::Helper->new({'.newfiles' => !$nonew});
pod2usage(1) unless $helper->mk_component( 'Music', @ARGV );

1;

=head1 NAME

music_create.pl - Create a new Catalyst Component

=head1 SYNOPSIS

music_create.pl [options] model|view|controller name [helper] [options]

 Options:
   -help    display this help and exits
   -nonew   don't create a .new file where a file to be created exists

 Examples:
   music_create.pl controller My::Controller
   music_create.pl view My::View
   music_create.pl view MyView TT
   music_create.pl view TT TT
   music_create.pl model My::Model
   music_create.pl model SomeDB CDBI dbi:SQLite:/tmp/my.db
   music_create.pl model AnotherDB CDBI dbi:Pg:dbname=foo root 4321

 See also:
   perldoc Catalyst::Manual
   perldoc Catalyst::Manual::Intro

=head1 DESCRIPTION

Create a new Catalyst Component.

Existing component files are not overwritten.  If any of the component files
to be created already exist the file will be written with a '.new' suffix.
This behaviour can be supressed with the C<-nonew> option.

=head1 AUTHOR

Sebastian Riedel, C<sri\@oook.de>

=head1 COPYRIGHT

Copyright 2004 Sebastian Riedel. All rights reserved.

This library is free software. You can redistribute it and/or modify
it under the same terms as perl itself.

=cut
