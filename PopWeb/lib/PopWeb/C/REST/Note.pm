package PopWeb::C::REST::Note;

use strict;
use base 'Catalyst::Base';

=head1 NAME

PopWeb::C::REST::Note - REST Controller Component

=head1 SYNOPSIS

See L<PopWeb>

=head1 DESCRIPTION

REST Controller Component.

=cut

sub default : Private {
    my ( $self, $c) = @_;
    $c->res->output('Congratulations, PopWeb::C::REST::Note is on Catalyst!');
}

sub note : Path('/rest/note') {
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

    my $note = PopWeb::M::CDBI::Note->retrieve($id);
    unless($note){
        $c->response->status(404);
        $c->res->output('ERROR');
        return;
    }
    my %note_hash;
    foreach my $column (PopWeb::M::CDBI::Note->columns) {
        $note_hash{$column} = $note->$column;
    }
    $c->stash->{note}=\%note_hash;
    $c->forward('PopWeb::V::XML');
}

sub add : Private {
    my ( $self, $c) = @_;

    $c->form( optional => [ PopWeb::M::CDBI::Note->columns ] );
    if ($c->form->has_missing) {
        $c->res->status(400); # Bad Request
    } elsif ($c->form->has_invalid) {
        $c->res->status(400); # Bad Request
    } else {
        # check permissions
        my $container_object=PopWeb::M::CDBI::Kernel->retrieve($c->form->valid('container_id'));
        if ($container_object->user->id != $c->req->{user_id}){
            $c->res->status(403); # Forbidden
            return $c->res->output('FORBIDDEN');
        }

        my $note = PopWeb::M::CDBI::Note->create_from_form( $c->form );
        $c->res->status(201); # Created
    	return $c->forward('view',[$note->id]);
    }
}

sub update : Private {
    my ( $self, $c, $id) = @_;

    $c->form( optional => [ PopWeb::M::CDBI::Note->columns ] );
    if ($c->form->has_missing) {
        $c->res->status(400); # Bad Request
        $c->res->output('ERROR');
    } elsif ($c->form->has_invalid) {
        $c->res->status(400); # Bad Request
        $c->res->output('ERROR');
    } else {
        # check permissions
        my $container_object=PopWeb::M::CDBI::Kernel->retrieve($c->form->valid('container_id'));
        if ($container_object->user->id != $c->req->{user_id}){
            $c->res->status(403); # Forbidden
            return $c->res->output('FORBIDDEN');
        }

        my $note = PopWeb::M::CDBI::Note->retrieve($id);
        unless($note){
            $c->res->status(404); # Not found
            return $c->res->output('ERROR');
        }
        $note->update_from_form( $c->form );
        $c->res->status(200); # OK
    	return $c->forward('view',[$id]);
    }
}

sub delete : Private {
    my ( $self, $c, $id) = @_;

    my $note = PopWeb::M::CDBI::Note->retrieve($id);
    if($note){
        $note->delete();
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
