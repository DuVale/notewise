package Notewise::C::REST;

use strict;
use warnings;
use base 'Catalyst::Controller';

=head1 NAME

Notewise::C::REST - Catalyst Controller

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

Catalyst Controller.

=head1 METHODS

=cut

sub ok: Private {
    my ( $self, $c) = @_;
    $c->res->status(200); # Ok
    return $c->res->output('OK');
}

sub error: Private {
    my ( $self, $c) = @_;
    $c->res->status(400); # Error
    return $c->res->output('ERROR');
}

sub forbidden: Private {
    my ( $self, $c) = @_;
    $c->res->status(403); # Forbidden
    return $c->res->output('FORBIDDEN');
}

sub notfound: Private {
    my ( $self, $c) = @_;
    $c->res->status(404); # Not found
    return $c->res->output('ERROR');
}


=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software, you can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;
