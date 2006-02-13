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

sub home : Local {
    my ( $self, $c, $username ) = @_;
    my $user = $c->model('CDBI::User')->search(username=>lc($username))->first;
    unless($user->id == $c->user->user->id){
        # TODO - need to make a different version for the public
        die "Sorry, you don't have permission to look at that user's homepage";
    }
    $c->stash->{user}=$user;

    $c->stash->{lastviewed}=[$c->model('CDBI::Kernel')->most_recently_viewed_kernel($user->id,15)];

    my @lastcreated=map $_->object, $c->model('CDBI::ObjectId')->search(user=>$user->id,type=>'kernel');
    # XXX this sort is going to be dog slow - need to swap this out for some actual sql
    @lastcreated=sort {$b->created <=> $a->created} @lastcreated;
    my $max = 15;
    if(@lastcreated < $max){
        $max = @lastcreated;
    }
    $c->stash->{lastcreated}=[@lastcreated[0..($max-1)]];

    $c->stash->{template} = 'User/home.tt';
}

=back

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
