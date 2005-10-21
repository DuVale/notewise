package PopWeb;

use strict;
use Catalyst qw/-Debug FormValidator/;

our $VERSION = '0.01';

PopWeb->config( name => 'PopWeb',
                'PopWeb::V::TT' => {
                    TIMER => 0,
                },
              );

PopWeb->setup( qw/Static::Simple/ );
PopWeb->config->{static}->{ignore_extensions} = [];

=head1 NAME

PopWeb - Catalyst based application

=head1 SYNOPSIS

    script/popweb_server.pl

=head1 DESCRIPTION

Catalyst based application.

=head1 METHODS

=over 4

=item default

=cut

sub default : Private {
    my ( $self, $c ) = @_;
    $c->res->output('Default app action');
}

sub end : Private {
    my ( $self, $c ) = @_;
    $c->forward('PopWeb::V::TT') unless $c->res->output;
}

=back

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
