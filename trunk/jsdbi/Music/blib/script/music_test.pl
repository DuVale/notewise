#!/usr/bin/perl5.8.6 -w

eval 'exec /usr/bin/perl5.8.6 -w -S $0 ${1+"$@"}'
    if 0; # not running under some shell

BEGIN { $ENV{CATALYST_ENGINE} ||= 'Test' }

use strict;
use Getopt::Long;
use Pod::Usage;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Music;

my $help = 0;

GetOptions( 'help|?' => \$help );

pod2usage(1) if ( $help || !$ARGV[0] );

print Music->run($ARGV[0])->content . "\n";

1;

=head1 NAME

music_test.pl - Catalyst Test

=head1 SYNOPSIS

music_test.pl [options] uri

 Options:
   -help    display this help and exits

 Examples:
   music_test.pl http://localhost/some_action
   music_test.pl /some_action

 See also:
   perldoc Catalyst::Manual
   perldoc Catalyst::Manual::Intro

=head1 DESCRIPTION

Run a Catalyst action from the comand line.

=head1 AUTHOR

Sebastian Riedel, C<sri@oook.de>

=head1 COPYRIGHT

Copyright 2004 Sebastian Riedel. All rights reserved.

This library is free software. You can redistribute it and/or modify
it under the same terms as perl itself.

=cut
