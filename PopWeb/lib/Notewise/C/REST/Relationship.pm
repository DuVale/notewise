package Notewise::C::REST::Relationship;

use strict;
use base 'Catalyst::Base';

=head1 NAME

Notewise::C::REST::Relationship - REST Controller Component

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

REST Controller Component.

=cut

sub default : Private {
    my ( $self, $c) = @_;
    $c->res->output('Congratulations, Notewise::C::REST::Relationship is on Catalyst!');
}

sub relationship : Path('/rest/relationship') {
    my ( $self, $c) = @_;

    my $method = $c->req->method;
    if($method eq 'GET'){
        $c->forward('view');
    } elsif($method eq 'PUT'){
        $c->forward('add');
    } elsif($method eq 'POST'){
        $c->forward('update');
    } elsif($method eq 'DELETE'){
        $c->forward('delete');
    }
}

sub view : Private {
    my ( $self, $c, $id) = @_;

    my $relationship = Notewise::M::CDBI::Relationship->retrieve($id);
    unless($relationship){
        $c->response->status(404);
        $c->res->output('ERROR');
        return;
    }
    my %relationship_hash;
    $c->stash->{relationship}=$relationship->to_xml_hash;
    $c->forward('Notewise::V::XML');
}

sub add : Private {
    my ( $self, $c) = @_;

    $c->form( optional => [ Notewise::M::CDBI::Relationship->columns ] );
    if ($c->form->has_missing) {
        $c->res->status(400); # Bad Request
    } elsif ($c->form->has_invalid) {
        $c->res->status(400); # Bad Request
    } else {
        my $relationship = Notewise::M::CDBI::Relationship->create_from_form( $c->form );
        $c->res->status(201); # Created
    	return $c->forward('view',[$relationship->id]);
    }
}

sub update : Private {
    my ( $self, $c, $id) = @_;

    $c->form( optional => [ Notewise::M::CDBI::Relationship->columns ] );
    if ($c->form->has_missing) {
        $c->res->status(400); # Bad Request
        $c->res->output('ERROR');
    } elsif ($c->form->has_invalid) {
        $c->res->status(400); # Bad Request
        $c->res->output('ERROR');
    } else {
        my $relationship = Notewise::M::CDBI::Relationship->retrieve($id);
        unless($relationship){
            $c->res->status(404); # Not found
            return $c->res->output('ERROR');
        }
        $relationship->update_from_form( $c->form );
        $c->res->status(200); # OK
    	return $c->forward('view',[$id]);
    }
}

sub delete : Private {
    my ( $self, $c, $id) = @_;

    my $relationship = Notewise::M::CDBI::Relationship->retrieve($id);
    if($relationship){
        $relationship->delete();
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
