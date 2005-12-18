package Notewise::M::CDBI::Relationship;

use strict;

__PACKAGE__->add_trigger(before_create => \&create_id);

__PACKAGE__->has_a(relationship_id => 'Notewise::M::CDBI::ObjectId');
__PACKAGE__->has_a(part1 => 'Notewise::M::CDBI::ObjectId');
__PACKAGE__->has_a(part2 => 'Notewise::M::CDBI::ObjectId');

sub create_id {
    my $self=shift;
    my $object_id = Notewise::M::CDBI::ObjectId->create({type=>'relationship'});
    $self->_attribute_store(relationship_id => $object_id->id);
}

sub to_xml_hash {
    my $self = shift;
    return {
        id => $self->relationship_id->id,
        part1 => $self->part1->id,
        part2 => $self->part2->id,
        type => $self->type,
        nav => $self->nav
    };
}

=head1 NAME

Notewise::M::CDBI::Relationship - CDBI Model Component Table Class

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

