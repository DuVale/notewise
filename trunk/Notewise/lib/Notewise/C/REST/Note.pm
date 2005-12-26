package Notewise::C::REST::Note;

use strict;
use base 'Catalyst::Base';
use DateTime::Format::DateParse;

=head1 NAME

Notewise::C::REST::Note - REST Controller Component

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

REST Controller Component.

=cut

sub default : Private {
    my ( $self, $c) = @_;
    $c->res->output('Congratulations, Notewise::C::REST::Note is on Catalyst!');
}

sub note : Path {
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

    my $note = Notewise::M::CDBI::Note->retrieve($id);
    unless($note){
        $c->response->status(404);
        $c->res->output('ERROR');
        return;
    }
    $c->stash->{note}=$note->to_xml_hash;
    $c->forward('Notewise::V::XML');
}

sub add : Private {
    my ( $self, $c) = @_;

    $c->form( optional => [ Notewise::M::CDBI::Note->columns ],
              field_filter_regexp_map => {
                  qr/^created|lastmodified|lastviewed$/i => sub { return DateTime::Format::DateParse->parse_datetime(shift); }
              }
            );
    if ($c->form->has_missing) {
        $c->res->status(400); # Bad Request
    } elsif ($c->form->has_invalid) {
        $c->res->status(400); # Bad Request
    } else {
        # check permissions
        my $container_object=Notewise::M::CDBI::Kernel->retrieve($c->form->valid('container_object'));
        if (check_user_is_owner($c, $container_object)){
            my $note = Notewise::M::CDBI::Note->create_from_form( $c->form );
            $note->user($c->req->{user_id});
            $note->update;
            $c->res->status(201); # Created
            return $c->forward('view',[$note->object_id->id]);
        }
    }
}

sub update : Private {
    my ( $self, $c, $id) = @_;

    $c->form( optional => [ Notewise::M::CDBI::Note->columns ] );
    if ($c->form->has_missing) {
        $c->res->status(400); # Bad Request
        $c->res->output('ERROR');
    } elsif ($c->form->has_invalid) {
        $c->res->status(400); # Bad Request
        $c->res->output('ERROR');
    } else {
        my $note = Notewise::M::CDBI::Note->retrieve($id);
        unless($note){
            $c->res->status(404); # Not found
            return $c->res->output('ERROR');
        }
        if(check_user_is_owner($c, $note)){
            $note->update_from_form( $c->form );
            $c->res->status(200); # OK
            return $c->forward('view',[$id]);
        }
    }
}

sub check_user_is_owner {
    my ($c,$object) = @_;

    # check permissions
    if ($object->user->id != $c->req->{user_id}){
        $c->res->status(403); # Forbidden
        $c->res->output('FORBIDDEN');
        return 0;
    }
    return 1;
}

sub delete : Private {
    my ( $self, $c, $id) = @_;

    my $note = Notewise::M::CDBI::Note->retrieve($id);
    if(check_user_is_owner($c, $note)){
        if($note){
            $note->delete();
            $c->res->status(200);
        } else {
            $c->res->status(404);
        }
        $c->res->output('OK');
    }
}

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
