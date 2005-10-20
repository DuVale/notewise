package PopWeb::C::Search;

use strict;
use base 'Catalyst::Base';
use CGI;

=head1 NAME

PopWeb::C::Search - Catalyst component

=head1 SYNOPSIS

See L<PopWeb>

=head1 DESCRIPTION

Catalyst component.

=head1 METHODS

=over 4

=item default

=cut

sub default : Private {
    my ( $self, $c ) = @_;
    $c->res->output('Congratulations, PopWeb::C::Search is on Catalyst!');
}

sub ac : Global {
    my ( $self, $c ) = @_;
    $c->stash->{kernels} = [PopWeb::M::CDBI::Kernel->search_where(name => { 'like', $c->req->params->{s}."%" })];
    $c->stash->{template} = 'Search/autocomplete-results.tt';
    #$c->res->output("<ul><li>a</li><li>b</li></ul>");
}

=back


=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
