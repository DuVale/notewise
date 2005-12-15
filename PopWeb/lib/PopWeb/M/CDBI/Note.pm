package PopWeb::M::CDBI::Note;

use strict;

__PACKAGE__->add_trigger(before_create => \&create_id);

sub create_id {
    my $self=shift;
    my $object_id = PopWeb::M::CDBI::ObjectId->create({type=>'note'});
    $self->_attribute_store(object_id => $object_id->id);
}

sub to_xml_hash {
    my $self = shift;
    return {
        id => $self->id,
        container_object => $self->container_object,
        content => $self->content,
        source => $self->source,
        created => $self->created,
        lastmodified => $self->lastModified,
        x => $self->x,
        y => $self->y,
        w => $self->w,
        h => $self->h,
    };
}

=head1 NAME

PopWeb::M::CDBI::Note - CDBI Model Component Table Class

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

