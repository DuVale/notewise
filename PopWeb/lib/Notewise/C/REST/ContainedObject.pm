package Notewise::C::REST::ContainedObject;

use strict;
use base 'Catalyst::Base';

=head1 NAME

Notewise::C::REST::ContainedObject - REST Controller Component

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

REST Controller Component.

=cut

sub default : Private {
    my ( $self, $c) = @_;
    $c->res->output('Congratulations, Notewise::C::REST::ContainedObject is on Catalyst!');
}

sub containedobject : Path {
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

    my $contained_object = (Notewise::M::CDBI::ContainedObject->search(container_object=>$container_id, contained_object=>$contained_id))[0];
    unless($contained_object){
        $c->detach('/rest/notfound');
    }

    # check permissions
    unless ($contained_object->has_permission($c->req->{user_id},'view')){
        $c->detach('/rest/forbidden');
    }

    # XXX the following hashkey should really be containedobject, no visiblekernel, to allow both /rest/containedobject and /rest/visiblekernel
    $c->stash->{visiblekernel}=$contained_object->to_xml_hash_deep;
    $c->forward('Notewise::V::XML');
}

sub add : Private {
    my ( $self, $c) = @_;

    $c->form( optional => [ Notewise::M::CDBI::ContainedObject->columns ] );
    if ($c->form->has_missing) {
        $c->detach('/rest/error');
    } elsif ($c->form->has_invalid) {
        $c->detach('/rest/error');
    }

    # This is a bit of a hack to allow us to add a newly created kernel to
    # this view in one request, instead of two, by allowing the values for
    # the kernel itself to be passed in as well
    $c->form( optional => [ Notewise::M::CDBI::ContainedObject->columns,
                            Notewise::M::CDBI::Kernel->columns] );

    # check permissions
    my $container_object=Notewise::M::CDBI::Kernel->retrieve(
                           $c->form->valid('container_object')
                         );
    unless ($container_object->has_permission($c->req->{user_id},'modify')){
        $c->detach('/rest/forbidden');
    }

    # figure out if we need to create the kernel as well
    unless($c->req->params->{contained_object}){
        my %create_hash;
        foreach my $column (Notewise::M::CDBI::Kernel->columns){
            $create_hash{$column} = $c->form->valid($column);
        }
        $create_hash{user}=$c->req->{user_id};
        my $kernel = Notewise::M::CDBI::Kernel->create( \%create_hash );
        $c->req->params->{contained_object}=$kernel->id;
    } else {
        my $contained_object=Notewise::M::CDBI::Kernel->retrieve(
                               $c->form->valid('contained_object')
                             );
        unless ($contained_object->has_permission($c->req->{user_id},'view')){
            $c->detach('/rest/forbidden');
        }
    }

    # cause $c->form to be generated again
    $c->form( optional => [ Notewise::M::CDBI::ContainedObject->columns,
                            Notewise::M::CDBI::Kernel->columns
                          ] );

    my $contained_object = Notewise::M::CDBI::ContainedObject->create_from_form( $c->form );

    $c->res->status(201); # Created
    return $c->forward('view',[$contained_object->container_object,
                               $contained_object->contained_object]);
}

sub update : Private {
    my ( $self, $c, $container_id, $contained_id) = @_;

    $c->form( optional => [ Notewise::M::CDBI::ContainedObject->columns ] );
    if ($c->form->has_missing) { $c->detach('/rest/error'); }
    elsif ($c->form->has_invalid) { $c->detach('/rest/error'); }

    # check permissions
    my $container=Notewise::M::CDBI::Kernel->retrieve($container_id);
    unless ($container->has_permission($c->req->{user_id},'modify')){
        $c->detach('/rest/forbidden');
    }

    # do the update
    my $contained_object = (
        Notewise::M::CDBI::ContainedObject->search(container_object=>$container_id,
                                                   contained_object=>$contained_id))[0];
    unless($contained_object){
        $c->detach('/rest/notfound');
    }
    $contained_object->update_from_form( $c->form );
    $c->detach('/rest/ok');
}

sub delete : Private {
    my ( $self, $c, $container_id, $contained_id) = @_;

    my $containedobject = (Notewise::M::CDBI::ContainedObject->search(container_object=>$container_id, contained_object=>$contained_id))[0];

    # check permissions
    unless ($containedobject->container_object->has_permission($c->req->{user_id},'modify')){
        $c->detach('/rest/forbidden');
    }

    if($containedobject){
        $containedobject->delete();
        $c->detach('/rest/ok');
    } else {
        $c->detach('/rest/notfound');
    }
}

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
