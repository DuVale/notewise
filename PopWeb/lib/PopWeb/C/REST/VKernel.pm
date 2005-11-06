package PopWeb::C::REST::VKernel;

use strict;
use warnings;
use base 'Catalyst::Base';

=head1 NAME

PopWeb::C::REST::VKernel - Catalyst component

=head1 SYNOPSIS

See L<PopWeb>

=head1 DESCRIPTION

Catalyst component.

=head1 METHODS

=over 4

=item default

Simple forward to /rest/containedobject

=cut

sub vkernel : Path('/rest/vkernel') {
    my ( $self, $c ) = @_;

    $c->forward('/rest/containedobject/containedobject');
}

=back


=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software, you can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;
