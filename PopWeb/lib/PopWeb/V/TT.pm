package PopWeb::V::TT;

use strict;
use base 'Catalyst::View::TT';
__PACKAGE__->config->{EVAL_PERL} = 1;
__PACKAGE__->config->{TIMER} = 0;
__PACKAGE__->config->{RECURSION} = 1;

=head1 NAME

PopWeb::V::TT - TT View Component

=head1 SYNOPSIS

See L<PopWeb>

=head1 DESCRIPTION

TT View Component.

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
