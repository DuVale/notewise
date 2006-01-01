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

sub search : Path {
    my ( $self, $c ) = @_;
    $c->res->output('Extended search goes here');
}

sub ac : Global {
    my ( $self, $c ) = @_;
    my $max_results = 15;

    my $searchstring = $c->req->params->{s};
    my @objects = Notewise::M::CDBI::Kernel->search_where(
                            name => { 'like', $searchstring."%" });
    if(@objects < $max_results){
        # if we didn't get enough, get some more
        push @objects, Notewise::M::CDBI::Kernel->search_where(
                            name => { 'like', "% ".$searchstring."%" });
    }

#    if(@objects < $max_results){
#        # if we didn't get enough, get some more
#        push @objects, Notewise::M::CDBI::Note->search_where(
#                            content => { 'like', $searchstring."%" });
#    }
#
#    if(@objects < $max_results){
#        # if we didn't get enough, get some more
#        push @objects, Notewise::M::CDBI::Note->search_where(
#                            content => { 'like', "% ".$searchstring."%" });
#    }

    # only show up to max_results and don't show duplicates and only show
    # things which we have access to
    my %objects_to_return;
    foreach my $object (@objects){
        last if(keys %objects_to_return >= $max_results);
        next unless $object->has_permission($c->req->{user_id},'view');
        #$objects_to_return{get_type($object).$object->id} = $object;
        $objects_to_return{$object->id} = $object;
    }

    $c->stash->{kernels} = [values %objects_to_return];

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
