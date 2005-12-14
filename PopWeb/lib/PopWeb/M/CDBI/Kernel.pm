package PopWeb::M::CDBI::Kernel;

use strict;
use warnings;
use DateTime;
use Data::Dumper;

__PACKAGE__->has_a(object_id => 'PopWeb::M::CDBI::ObjectId');

__PACKAGE__->add_trigger(before_create => \&create_id);
__PACKAGE__->add_trigger(before_create => \&add_created_date);

__PACKAGE__->columns(TEMP => qw/user/);
sub user {
    my $self=shift;
    if ($self->object_id){
        # gets called after object is created and has an object_id
        return $self->object_id->user(@_);
    } else {
        # only gets called by before_create triggers
        return $self->{user};
    }
}

sub create_id {
    my $self=shift;
    my $object_id = PopWeb::M::CDBI::ObjectId->create({user=>$self->user,type=>'kernel'});
    $self->_attribute_store(object_id => $object_id->id);
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
            id => $self->object_id->id,
            user => $self->id->user->id,
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
                id => $self->object_id->id,
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

sub parents {
    my $self = shift;
    my @contained_ids = PopWeb::M::CDBI::ContainedObject->search(contained_object => $self->id);
    my @parents = map $_->container_kernel, @contained_ids;
    return @parents;
}

sub related_kernels {
    my $self = shift;
    my @relationships1 = PopWeb::M::CDBI::Relationship->search(part1 => $self->id);
    my @relationships2 = PopWeb::M::CDBI::Relationship->search(part2 => $self->id);
    my @related_kernels = ((map $_->part2->object, @relationships1),(map $_->part1->object, @relationships2));
    return @related_kernels;
}

sub notes {
    my $self = shift;
    my @notes = PopWeb::M::CDBI::Note->search(container_object => $self->id);
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

