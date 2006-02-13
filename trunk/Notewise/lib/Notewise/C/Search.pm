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

# quick search
sub s : Global {
    my ( $self, $c ) = @_;
    $c->stash->{template} = 'Search/quicksearch-results.tt';
    $c->forward('quick_search');
}

# kernel autocomplete
sub ac : Global {
    my ( $self, $c ) = @_;
    $c->stash->{template} = 'Search/autocomplete-results.tt';
    $c->forward('quick_search');
}

# actual search code for s and ac
sub quick_search : Private {
    # TODO refactor this
    my ( $self, $c ) = @_;
    my $max_results = 15;

    my $searchstring = $c->req->params->{s};
    my @objects = grep {$_->has_permission($c->user->user->id,'view')}
                    Notewise::M::CDBI::Kernel->search_where(
                            name => { 'like', $searchstring."%" });
    if(@objects < $max_results){
        # if we didn't get enough, get some more
        push @objects,
            grep {$_->has_permission($c->user->user->id,'view')}
                Notewise::M::CDBI::Kernel->search_where(
                    name => { 'like', "% ".$searchstring."%" });
    }

    if(@objects < $max_results){
        # if we didn't get enough, get some more
        push @objects,
            grep {$_->kernel->has_permission($c->user->user->id,'view')}
                Notewise::M::CDBI::Note->search_where(
                    content => { 'like', $searchstring."%" });
    }

    if(@objects < $max_results){
        # if we didn't get enough, get some more
        push @objects,
            grep {$_->kernel->has_permission($c->user->user->id,'view')}
                Notewise::M::CDBI::Note->search_where(
                    content => { 'like', "% ".$searchstring."%" });
    }

    # only show up to max_results and don't show duplicates
    my %objects_seen;
    my @objects_to_return;
    foreach my $object (@objects){
        last if(@objects_to_return >= $max_results);
        if(!$objects_seen{$object->id}){
            $objects_seen{$object->id} = $object;
            push @objects_to_return, $object;
        }
    }

    $c->stash->{objects} = [@objects_to_return];
}

=back


=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
