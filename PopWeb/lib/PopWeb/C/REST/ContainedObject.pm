package PopWeb::C::REST::ContainedObject;

use strict;
use base 'Catalyst::Base';

=head1 NAME

PopWeb::C::REST::ContainedObject - REST Controller Component

=head1 SYNOPSIS

See L<PopWeb>

=head1 DESCRIPTION

REST Controller Component.

=cut

sub default : Private {
    my ( $self, $c) = @_;
    $c->res->output('Congratulations, PopWeb::C::REST::ContainedObject is on Catalyst!');
}

sub containedobject : Path('/rest/containedobject') {
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
    my ( $self, $c, $container_id, $contained_id) = @_;

    my $contained_object = PopWeb::M::CDBI::ContainedObject->retrieve(container_object=>$container_id, contained_object=>$contained_id);
    # XXX the following hashkey should really be containedobject, no visiblekernel, to allow both /rest/containedobject and /rest/visiblekernel
    $c->stash->{visiblekernel}=$contained_object->to_xml_hash_deep;
    $c->forward('PopWeb::V::XML');
}

sub add : Private {
    my ( $self, $c) = @_;

    $c->form( optional => [ PopWeb::M::CDBI::ContainedObject->columns ] );
    if ($c->form->has_missing) {
        $c->res->status(400); # Bad Request
    } elsif ($c->form->has_invalid) {
        $c->res->status(400); # Bad Request
    } else {
        $c->form( optional => [ PopWeb::M::CDBI::ContainedObject->columns, PopWeb::M::CDBI::Kernel->columns] );

        # check permissions
        my $container_object=PopWeb::M::CDBI::Kernel->retrieve($c->form->valid('container_object'));
        if ($container_object->user->id != $c->req->{user_id}){
            $c->res->status(403); # Forbidden
            return $c->res->output('FORBIDDEN');
        }

        unless($c->req->params->{contained_object}){
            my %create_hash;
            foreach my $column (PopWeb::M::CDBI::Kernel->columns){
                $create_hash{$column} = $c->form->valid($column);
            }
            $create_hash{user}=$c->req->{user_id};
            my $kernel = PopWeb::M::CDBI::Kernel->create( \%create_hash );
            $c->req->params->{contained_object}=$kernel->id;
        }

        # cause $c->form to be generated again
        $c->form( optional => [ PopWeb::M::CDBI::ContainedObject->columns, PopWeb::M::CDBI::Kernel->columns ] );
	my $contained_object = PopWeb::M::CDBI::ContainedObject->create_from_form( $c->form );

        $c->res->status(201); # Created
    	return $c->forward('view',[$contained_object->id]);
    }
}

sub update : Private {
    my ( $self, $c, $container_id, $contained_id) = @_;

    $c->form( optional => [ PopWeb::M::CDBI::ContainedObject->columns ] );
    if ($c->form->has_missing) {
        $c->res->status(400); # Bad Request
        $c->res->output('ERROR');
    } elsif ($c->form->has_invalid) {
        $c->res->status(400); # Bad Request
        $c->res->output('ERROR');
    } else {
        # check permissions
        my $container=PopWeb::M::CDBI::Kernel->retrieve($container_id);
        if ($container->user->id != $c->req->{user_id}){
            $c->res->status(403); # Not found
            return $c->res->output('FORBIDDEN');
        }

        # do the update
        my $contained_object = PopWeb::M::CDBI::ContainedObject->retrieve(container_object=>$container_id,contained_object=>$contained_id);
        unless($contained_object){
            $c->res->status(404); # Not found
            return $c->res->output('ERROR');
        }
        $contained_object->update_from_form( $c->form );
        $c->res->status(200); # OK
	$c->res->output('OK');
    }
}

sub delete : Private {
    my ( $self, $c, $id) = @_;

    my $containedobject = PopWeb::M::CDBI::ContainedObject->retrieve($id);
    if($containedobject){
        $containedobject->delete();
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
