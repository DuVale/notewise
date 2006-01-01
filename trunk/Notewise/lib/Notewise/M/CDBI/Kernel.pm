package Notewise::M::CDBI::Kernel;

use strict;
use warnings;
use DateTime;
use Data::Dumper;

__PACKAGE__->has_a(object_id => 'Notewise::M::CDBI::ObjectId');

__PACKAGE__->has_a(created => 'DateTime', inflate=> \&Notewise::M::CDBI::inflate_datetime,
                                          deflate=> \&Notewise::M::CDBI::deflate_datetime);
__PACKAGE__->has_a(lastmodified => 'DateTime', inflate=> \&Notewise::M::CDBI::inflate_timestamp,
                                               deflate=> \&Notewise::M::CDBI::deflate_timestamp);
__PACKAGE__->has_a(lastViewed => 'DateTime', inflate=> \&Notewise::M::CDBI::inflate_timestamp,
                                             deflate=> \&Notewise::M::CDBI::deflate_timestamp);

__PACKAGE__->add_trigger(before_create => \&create_id);
__PACKAGE__->add_trigger(before_create => \&Notewise::M::CDBI::add_created_date);

__PACKAGE__->columns(TEMP => qw/user/);

__PACKAGE__->add_trigger(after_create => \&hydrate_object_id);
sub hydrate_object_id {
    my $self = shift;
    my $object_id = Notewise::M::CDBI::ObjectId->retrieve($self->object_id);
    $self->_attribute_store(object_id => $object_id);
}

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
    my $object_id = Notewise::M::CDBI::ObjectId->create({user=>$self->user,type=>'kernel'});
    $self->_attribute_store(object_id => $object_id->id);
}

sub to_xml_hash {
    return to_xml_hash_shallow(@_);
}

sub to_xml_hash_shallow {
    my $self = shift;
    return {
            id => $self->object_id->id,
            user => $self->user->id,
            name => $self->name,
            uri => $self->uri,
            source => $self->source,
            created => $self->created ? $self->created->strftime($self->strf_format) : '',
            lastmodified => $self->lastModified ? $self->lastModified->strftime($self->strf_format): '',
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
                created => $self->created ? $self->created->strftime($self->strf_format) : '',
                lastmodified => $self->lastModified ? $self->lastModified->strftime($self->strf_format): '',
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
    my @contained_ids = Notewise::M::CDBI::ContainedObject->search(container_object => $self->id);
    return map $_, @contained_ids;
}

sub parents {
    my $self = shift;
    my @contained_ids = Notewise::M::CDBI::ContainedObject->search(contained_object => $self->id);
    my @parents = map $_->container_kernel, @contained_ids;
    return @parents;
}

sub related_kernels {
    my $self = shift;
    my @relationships1 = Notewise::M::CDBI::Relationship->search(part1 => $self->id);
    my @relationships2 = Notewise::M::CDBI::Relationship->search(part2 => $self->id);
    my @related_objects = ((map $_->part2->object, @relationships1),(map $_->part1->object, @relationships2));
    @related_objects = grep {ref($_) =~ /::Kernel$/} @related_objects;
    return @related_objects;
}

sub related_objects {
    my $self = shift;
    my @relationships1 = Notewise::M::CDBI::Relationship->search(part1 => $self->id);
    my @relationships2 = Notewise::M::CDBI::Relationship->search(part2 => $self->id);
    my @related_objects = ((map $_->part2->object, @relationships1),(map $_->part1->object, @relationships2));
    return @related_objects;
}

sub relationships {
    my $self = shift;
    my @relationships1 = Notewise::M::CDBI::Relationship->search(part1 => $self->id);
    my @relationships2 = Notewise::M::CDBI::Relationship->search(part2 => $self->id);
    return (@relationships1,@relationships2);
}

sub notes {
    my $self = shift;
    my @notes = Notewise::M::CDBI::Note->search(container_object => $self->id);
    return @notes;
}

sub has_permission {
    my $self = shift;
    return $self->object_id->has_permission(@_);
}

# returns all the relationships that are visible on this kernel - all relationships for which both endpoints are on this kernel
sub visible_relationships {
    my $self = shift;
    my @notes = $self->notes;
    my @kernels = map $_->contained_kernel, $self->contained_objects;

    # give us fast O(1) access to find out if an object is on this view,
    # without hitting the db any more than is necessary
    my %object_ids = map {$_->id => 1} (@notes,@kernels);
    my %visible_relationships;

    foreach my $object (@notes, @kernels){
        foreach my $relationship ($object->relationships){
            if($object_ids{$relationship->part1->id}
               && $object_ids{$relationship->part2->id}){
               $visible_relationships{$relationship} = $relationship;
            }
        }
    }
    return values %visible_relationships;
}

=head1 NAME

Notewise::M::CDBI::Kernel - CDBI Model Component Table Class

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

