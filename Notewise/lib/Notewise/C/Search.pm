package Notewise::C::Search;

use strict;
use base 'Catalyst::Base';
use CGI;
use POSIX;

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

    my $start_index = ($c->req->params->{start}||1) - 1; # start is one based
    my $amount = $c->req->params->{count} || 10;
    if($amount < 10 || $amount > 100){
        $amount = 10;
    }

    my $searchstring = $c->req->params->{s};

    my @objects = $self->do_search($c, $searchstring,500);
    warn "found count: ".scalar @objects;

    $c->stash->{start_index} = $start_index + 1;
    if($c->stash->{start_index} > @objects){
        $c->stash->{start_index} = @objects;
    }
    $c->stash->{end_index} = $start_index + $amount;
    if($c->stash->{end_index} > @objects){
        $c->stash->{end_index} = @objects;
    }
    $c->stash->{amount} = $amount;
    $c->stash->{results} = [ @objects[$start_index..$start_index+$amount] ];
    $c->stash->{count} = scalar @objects;
    $c->stash->{current_page} = POSIX::ceil(($start_index+1)/$amount);
    my $last_page = POSIX::ceil(@objects/$amount) || 1;
    $c->stash->{pages} = [1..$last_page];
    $c->stash->{template} = 'Search/search.tt';
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

sub quick_search : Private {
    # TODO refactor this
    my ( $self, $c ) = @_;
    my $max_results = 15;

    my $searchstring = $c->req->params->{s};

    my @objects = $self->do_search($c, $searchstring,$max_results+1);
    $c->stash->{more_results} = $objects[$max_results];
    $c->stash->{objects} = \@objects;
}

# actual search code for s and ac
sub do_search {
    # TODO refactor this
    my $self = shift;
    my $c = shift;
    my $searchstring = shift;
    my $max_results = shift;

    my @objects = grep {$_->has_permission($c->user->user->id,'view')}
                    $c->model('CDBI::Kernel')->search_where(
                            name => { 'like', $searchstring."%" });
    if(@objects < $max_results){
        # if we didn't get enough, get some more
        push @objects,
            grep {$_->has_permission($c->user->user->id,'view')}
                $c->model('CDBI::Kernel')->search_where(
                    name => { 'like', "% ".$searchstring."%" });
    }

    if(@objects < $max_results){
        # if we didn't get enough, get some more
        push @objects,
            grep {$_->kernel->has_permission($c->user->user->id,'view')}
                $c->model('CDBI::Note')->search_where(
                    content => { 'like', $searchstring."%" });
    }

    if(@objects < $max_results){
        # if we didn't get enough, get some more
        push @objects,
            grep {$_->kernel->has_permission($c->user->user->id,'view')}
                $c->model('CDBI::Note')->search_where(
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

    return @objects_to_return;
}

=back


=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
