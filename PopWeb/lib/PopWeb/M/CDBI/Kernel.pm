package PopWeb::M::CDBI::Kernel;

use strict;
use warnings;
use DateTime;

__PACKAGE__->add_trigger(before_create => \&create_id);
__PACKAGE__->add_trigger(before_create => \&add_created_date);

sub create_id {
    my $self=shift;
    my $object_id = PopWeb::M::CDBI::ObjectId->create({type=>'kernel'});
    $self->_attribute_store(id => $object_id->id);
}

sub add_created_date {
    my $self=shift;
    unless($self->created){
        # XXX this returns UTC, not server time
        my $now = DateTime->now();
        $self->_attribute_store(created => $now->ymd('-').' '.$now->hms);
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
    my @contained_kernels = map $_->to_xml_hash_deep(), $self->contained_objects;
    my @contained_notes = map $_->to_xml_hash, $self->notes;
    my @contained_relationships; #= $self->visible_relationships;
    return {kernel=>{
                id => $self->id,
                name => $self->name,
                uri => $self->uri,
                source => $self->source,
                created => $self->created,
                lastModified => $self->lastModified,
                containedObjects => {
                    visiblekernel => [ @contained_kernels ],
                    note => [ @contained_notes ],
                    relationship => [ @contained_relationships ],
                }
            }
    };
}

sub contained_objects {
    my $self = shift;
    my @contained_ids = PopWeb::M::CDBI::ContainedObject->search(container_object => $self->id);
    return map $_, @contained_ids;
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

