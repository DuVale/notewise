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

sub relationship : Path {
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
        $c->detach('/rest/notfound',["couldn't find relationship with id $id"]);
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
        $c->detach('/rest/error',['missing fields']);
    } elsif ($c->form->has_invalid) {
        $c->detach('/rest/error',['invalid fields']);
    } else {
        my $relationship = Notewise::M::CDBI::Relationship->create_from_form( $c->form );
        $relationship = Notewise::M::CDBI::Relationship->retrieve($relationship->id);
        $relationship->user($c->req->{user_id});
        $relationship->update;

        # fetch the correct type object
        my $type = Notewise::M::CDBI::RelationshipType->find_or_create({relationship_type=>$c->req->params->{type}});
        $relationship->type($type->id);
        $relationship->update;
        $c->res->status(201); # Created
    	return $c->forward('view',[$relationship->id]);
    }
}

sub update : Private {
    my ( $self, $c, $id) = @_;

    $c->form( optional => [ Notewise::M::CDBI::Relationship->columns ] );
    if ($c->form->has_missing) {
        $c->detach('/rest/error',['missing fields']);
    } elsif ($c->form->has_invalid) {
        $c->detach('/rest/error',['invalid fields']);
    } else {
        my $relationship = Notewise::M::CDBI::Relationship->retrieve($id);
        unless($relationship){
            $c->detach('/rest/notfound',["couldn't find relationship with id $id"]);
        }
        $relationship->update_from_form( $c->form );

        # fetch the correct type object
        my $type = Notewise::M::CDBI::RelationshipType->find_or_create({relationship_type=>$c->req->params->{type}});
        $relationship->type($type->id);
        $relationship->update;

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
        $c->detach('/rest/notfound',["couldn't find relationship with id $id"]);
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
