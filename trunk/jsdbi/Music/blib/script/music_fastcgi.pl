#!/usr/bin/perl5.8.6 -w

eval 'exec /usr/bin/perl5.8.6 -w -S $0 ${1+"$@"}'
    if 0; # not running under some shell

BEGIN { $ENV{CATALYST_ENGINE} ||= 'FastCGI' }

use strict;
use FindBin;
use lib "$FindBin::Bin/../lib";
use Music;

Music->run;

1;

=head1 NAME

music_fastcgi.pl - Catalyst FastCGI

=head1 SYNOPSIS

See L<Catalyst::Manual>

=head1 DESCRIPTION

Run a Catalyst application as fastcgi.

=head1 AUTHOR

Sebastian Riedel, C<sri@oook.de>

=head1 COPYRIGHT

Copyright 2004 Sebastian Riedel. All rights reserved.

This library is free software. You can redistribute it and/or modify
it under the same terms as perl itself.

=cut
