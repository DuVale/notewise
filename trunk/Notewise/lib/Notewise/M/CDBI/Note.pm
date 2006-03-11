package Notewise::M::CDBI::Note;

use strict;

__PACKAGE__->has_a(object_id => 'Notewise::M::CDBI::ObjectId');
__PACKAGE__->has_a(container_object => 'Notewise::M::CDBI::ObjectId');

__PACKAGE__->columns(TEMP => qw/user/);

__PACKAGE__->has_a(created => 'DateTime', inflate=> \&Notewise::M::CDBI::inflate_datetime,
                                          deflate=> \&Notewise::M::CDBI::deflate_datetime);
__PACKAGE__->has_a(lastmodified => 'DateTime', inflate=> \&Notewise::M::CDBI::inflate_timestamp,
                                               deflate=> \&Notewise::M::CDBI::deflate_timestamp);

__PACKAGE__->add_trigger(before_create => \&create_id);
__PACKAGE__->add_trigger(before_create => \&Notewise::M::CDBI::add_created_date);
__PACKAGE__->add_trigger(after_create => \&hydrate_object_id);
__PACKAGE__->add_trigger(before_delete => sub {
     my $self = shift;
     map $_->delete, Notewise::M::CDBI::Relationship->search(part1 => $self->object_id->id);
     map $_->delete, Notewise::M::CDBI::Relationship->search(part2 => $self->object_id->id);
});

__PACKAGE__->add_trigger(after_delete => sub {
     my $self = shift;
     $self->object_id->delete;
});

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
    my $object_id = Notewise::M::CDBI::ObjectId->create({user=>$self->user,type=>'note'});
    $self->_attribute_store(object_id => $object_id);
}

sub to_xml_hash {
    my $self = shift;
    return {
        id => $self->object_id->id,
        container_object => $self->container_object->id,
        content => $self->content,
        source => $self->source,
        created => $self->created->strftime($self->strf_format),
        lastmodified => $self->lastModified->strftime($self->strf_format),
        x => $self->x,
        y => $self->y,
        width => $self->width,
        height => $self->height,
    };
}

sub has_permission {
    my $self = shift;
    return $self->object_id->has_permission(@_);
}

sub relationships {
    my $self = shift;
    my @relationships1 = Notewise::M::CDBI::Relationship->search(part1 => $self->id);
    my @relationships2 = Notewise::M::CDBI::Relationship->search(part2 => $self->id);
    return (@relationships1,@relationships2);
}

sub kernel {
    my $self = shift;
    return $self->container_object->object;
}

=head1 NAME

Notewise::M::CDBI::Note - CDBI Model Component Table Class

=head1 SYNOPSIS

    Very simple to use

=head1 DESCRIPTION

Very nice component.

=head1 AUTHOR

Clever guy

=head1 LICENSE

This library is free software . You can redistribute it and/or modify it under
the same terms as perl itself.

=cut

1;

