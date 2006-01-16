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
    my $user = Notewise::M::CDBI::User->search(username=>lc($username))->first;
    unless($user->id == $c->req->{user_id}){
        # TODO - need to make a different version for the public
        die "Sorry, you don't have permission to look at that user's homepage";
    }
    $c->stash->{user}=$user;

    my @lastviewed=map $_->object, Notewise::M::CDBI::ObjectId->search(user=>$user->id,type=>'kernel');
    # XXX this sort is going to be dog slow - need to swap this out for some actual sql
    @lastviewed=sort {$b->lastviewed <=> $a->lastviewed} @lastviewed;
    my $max = 5;
    if(@lastviewed < $max){
        $max = @lastviewed;
    }
    $c->stash->{lastviewed}=[@lastviewed[0..($max-1)]];

    my @lastcreated=map $_->object, Notewise::M::CDBI::ObjectId->search(user=>$user->id,type=>'kernel');
    # XXX this sort is going to be dog slow - need to swap this out for some actual sql
    @lastcreated=sort {$b->created <=> $a->created} @lastcreated;
    $max = 5;
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
