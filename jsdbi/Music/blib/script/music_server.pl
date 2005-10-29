#!/usr/bin/perl5.8.6 -w

eval 'exec /usr/bin/perl5.8.6 -w -S $0 ${1+"$@"}'
    if 0; # not running under some shell

BEGIN { 
    $ENV{CATALYST_ENGINE} ||= 'HTTP';
    $ENV{CATALYST_SCRIPT_GEN} = 4;
}  

use strict;
use Getopt::Long;
use Pod::Usage;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Music;

my $help = 0;
my $port = 3000;

GetOptions( 'help|?' => \$help, 'port=s' => \$port );

pod2usage(1) if $help;

Music->run($port);

1;

=head1 NAME

music_server.pl - Catalyst Testserver

=head1 SYNOPSIS

music_server.pl [options]

 Options:
   -? -help    display this help and exits
   -p -port    port (defaults to 3000)

 See also:
   perldoc Catalyst::Manual
   perldoc Catalyst::Manual::Intro

=head1 DESCRIPTION

Run a Catalyst Testserver for this application.

=head1 AUTHOR

Sebastian Riedel, C<sri@oook.de>

=head1 COPYRIGHT

Copyright 2004 Sebastian Riedel. All rights reserved.

This library is free software. You can redistribute it and/or modify
it under the same terms as perl itself.

=cut
