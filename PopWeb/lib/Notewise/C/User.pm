package Notewise::C::User;

use strict;
use base 'Catalyst::Base';

=head1 NAME

Notewise::C::User - Scaffolding Controller Component

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

Scaffolding Controller Component.

=head1 METHODS

=over 4

=cut

sub login : Local {
    my ( $self, $c ) = @_;
    $c->stash->{template} = 'User/login.tt';
}

=back

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
