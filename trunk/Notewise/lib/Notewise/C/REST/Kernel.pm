package Notewise::C::REST::Kernel;

use strict;
use base 'Catalyst::Base';

=head1 NAME

Notewise::C::REST::Kernel - REST Controller Component

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

REST Controller Component.

=cut

sub default : Private {
    my ( $self, $c) = @_;
    $c->res->output('Congratulations, Notewise::C::REST::Kernel is on Catalyst!');
}

sub kernel : Path {
    my ( $self, $c, $id, $action) = @_;

    my $method = $c->req->method;
    if(defined $action && $action eq 'children'){
        $c->forward('children');
    } elsif($method eq 'GET'){
        $c->forward('view');
    } elsif($method eq 'PUT'){
        $c->forward('add');
    } elsif($method eq 'POST'){
        $c->forward('update');
    } elsif($method eq 'DELETE'){
        $c->forward('delete');
    }
}

sub children : Private {
    my ( $self, $c, $id) = @_;

    my $kernel = Notewise::M::CDBI::Kernel->retrieve($id);
    unless($kernel){
        $c->response->status(404);
        $c->res->output('ERROR');
        return;
    }
    $c->stash->{visiblekernel}=[map $_->to_xml_hash_deep, $kernel->contained_objects];
    $c->forward('Notewise::V::XML');
}

sub view : Private {
    my ( $self, $c, $id) = @_;

    my $kernel = Notewise::M::CDBI::Kernel->retrieve($id);
    unless($kernel){
        $c->response->status(404);
        $c->res->output('ERROR');
        return;
    }
    $c->stash->{kernel}=$kernel->to_xml_hash_deep;
    $c->forward('Notewise::V::XML');
}

sub add : Private {
    my ( $self, $c) = @_;

    $c->form( optional => [ Notewise::M::CDBI::Kernel->columns ] );
    if ($c->form->has_missing) {
        $c->res->status(400); # Bad Request
    } elsif ($c->form->has_invalid) {
        $c->res->status(400); # Bad Request
    } else {
        my $kernel = Notewise::M::CDBI::Kernel->create_from_form( $c->form );
        $kernel->user($c->req->{user_id});
        $kernel->update;
        $c->res->status(201); # Created
    	return $c->forward('view',[$kernel->object_id->id]);
    }
}

sub update : Private {
    my ( $self, $c, $id) = @_;

    $c->form( optional => [ Notewise::M::CDBI::Kernel->columns ] );
    if ($c->form->has_missing) {
        $c->res->status(400); # Bad Request
        $c->res->output('ERROR');
    } elsif ($c->form->has_invalid) {
        $c->res->status(400); # Bad Request
        $c->res->output('ERROR');
    } else {
        my $kernel = Notewise::M::CDBI::Kernel->retrieve($id);
        unless($kernel){
            $c->res->status(404); # Not found
            return $c->res->output('ERROR');
        }
        $kernel->update_from_form( $c->form );
        $c->res->status(200); # OK
    	return $c->forward('view',[$id]);
    }
}

sub delete : Private {
    my ( $self, $c, $id) = @_;

    my $kernel = Notewise::M::CDBI::Kernel->retrieve($id);
    if($kernel){
        $kernel->delete();
        $c->res->status(200);
    } else {
        $c->res->status(404);
    }
    $c->res->output('OK');
}

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
