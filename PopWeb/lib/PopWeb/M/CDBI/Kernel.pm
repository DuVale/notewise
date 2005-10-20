package PopWeb::M::CDBI::Kernel;

use strict;
use warnings;

__PACKAGE__->add_trigger(before_create => \&create_id);

sub create_id {
    my $self=shift;
    my $object_id = PopWeb::M::CDBI::ObjectId->create({type=>'kernel'});
    $self->_attribute_store(id => $object_id->id);
}

sub visible_xml_hash {
    my $self = shift;
    my $container_object = shift;
    my $contained_object = PopWeb::M::CDBI::ContainedObject->retrieve(
                                container_object=>$container_object->id,
                                contained_object=>$self->id,
                            );
    return {
        id=>$self->id,
        x=>$contained_object->x,
        y=>$contained_object->y,
        zoomlevel=>$contained_object->zoomlevel,
        collapsed=>$contained_object->collapsed,
    }
}

sub to_xml_hash_shallow {
    my $self = shift;
    return {
            id => $self->id,
            name => $self->name,
            uri => $self->uri,
            source => $self->source,
            created => $self->created,
            lastModified => $self->lastModified,
    };
}

sub to_xml_hash_deep {
    my $self = shift;
    my @contained_kernels = map $_->visible_xml_hash($self), $self->contained_objects;
    my @contained_notes = map $_->to_xml_hash, $self->notes;
    my @contained_relationships; #= $self->visible_relationships;
    return {
            id => $self->id,
            name => $self->name,
            uri => $self->uri,
            source => $self->source,
            created => $self->created,
            lastModified => $self->lastModified,
            containedObjects => {
                kernel => [ @contained_kernels ],
                note => [ @contained_notes ],
                relationship => [ @contained_relationships ],
            }
    };
}

sub contained_objects {
    my $self = shift;
    my @contained_ids = PopWeb::M::CDBI::ContainedObject->search(container_object => $self->id);
    return map $_->contained_object->object, @contained_ids;
}

sub notes {
    my $self = shift;
    my @notes = PopWeb::M::CDBI::Note->search(container => $self->id);
    return @notes;
}

=head1 NAME

PopWeb::M::CDBI::Kernel - CDBI Model Component Table Class

=head1 SYNOPSIS

    Very simple to use

=head1 DESCRIPTION

Very nice component.

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify it under
the same terms as perl itself.

=cut

1;

