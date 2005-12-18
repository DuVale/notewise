package Notewise::C::Search;

use strict;
use base 'Catalyst::Base';
use CGI;

=head1 NAME

Notewise::C::Search - Catalyst component

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

Catalyst component.

=head1 METHODS

=over 4

=item default

=cut

sub default : Private {
    my ( $self, $c ) = @_;
    $c->res->output('Congratulations, Notewise::C::Search is on Catalyst!');
}

sub ac : Global {
    my ( $self, $c ) = @_;
    my $max_results = 15;

    my @kernels = Notewise::M::CDBI::Kernel->search_where(name => { 'like', $c->req->params->{s}."%" });
    if(@kernels < $max_results){
        # if we didn't get enough, get some more
        push @kernels, Notewise::M::CDBI::Kernel->search_where(name => { 'like', "% ".$c->req->params->{s}."%" });
    }

    # only show up to max_results
    my $upper_count = @kernels < $max_results ? $#kernels : $max_results - 1;
    $c->stash->{kernels} = [@kernels[0..$upper_count]];

    $c->stash->{template} = 'Search/autocomplete-results.tt';
}

=back


=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
