#!/usr/bin/perl -w

use strict;
use Getopt::Long;
use Pod::Usage;
use Catalyst::Helper;
use lib ('./lib');
use PopWeb;


my $force = 0;
my $help  = 0;
my $short = 0;

GetOptions(
    'nonew|force' => \$force,
    'help|?'      => \$help,
    'short'       => \$short
 );

pod2usage(1) if ( $help || !$ARGV[0] );

my $helper =
    Catalyst::Helper->new( { '.newfiles' => !$force, short => $short } );

pod2usage(1) unless $helper->mk_component( 'PopWeb', @ARGV );

1;

=head1 NAME

popweb_create.pl - Create a new Catalyst Component

=head1 SYNOPSIS

popweb_create.pl [options] model|view|controller name [helper] [options]

 Options:
   -force    don't create a .new file where a file to be created exists
   -help     display this help and exits
   -short    use short types, like C instead of Controller...

 Examples:
   popweb_create.pl controller My::Controller
   popweb_create.pl view My::View
   popweb_create.pl view MyView TT
   popweb_create.pl view TT TT
   popweb_create.pl model My::Model
   popweb_create.pl model SomeDB CDBI dbi:SQLite:/tmp/my.db
   popweb_create.pl model AnotherDB CDBI dbi:Pg:dbname=foo root 4321

 See also:
   perldoc Catalyst::Manual
   perldoc Catalyst::Manual::Intro

=head1 DESCRIPTION

Create a new Catalyst Component.

Existing component files are not overwritten.  If any of the component files
to be created already exist the file will be written with a '.new' suffix.
This behavior can be suppressed with the C<-force> option.

=head1 AUTHOR

Sebastian Riedel, C<sri@oook.de>

=head1 COPYRIGHT

Copyright 2004 Sebastian Riedel. All rights reserved.

This library is free software, you can redistribute it and/or modify
it under the same terms as Perl itself.

=cut
