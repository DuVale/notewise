package Notewise::M::CDBI::Relationship;

use strict;

__PACKAGE__->add_trigger(before_create => \&create_id);

__PACKAGE__->has_a(relationship_id => 'Notewise::M::CDBI::ObjectId');
__PACKAGE__->has_a(part1 => 'Notewise::M::CDBI::ObjectId');
__PACKAGE__->has_a(part2 => 'Notewise::M::CDBI::ObjectId');
__PACKAGE__->has_a(type => 'Notewise::M::CDBI::RelationshipType');

__PACKAGE__->columns(TEMP => qw/user/);

# search_rels_for_user
__PACKAGE__->set_sql( rels_for_user => qq{
    SELECT relationship.relationship_id
      FROM relationship, object_id
     WHERE relationship.relationship_id = object_id.id
     AND object_id.user = ?
     ORDER BY relationship.relationship_id DESC
});

sub create_id {
    my $self=shift;
    my $object_id = Notewise::M::CDBI::ObjectId->create({user=>$self->user,type=>'relationship'});
    $self->_attribute_store(relationship_id => $object_id);
}

sub to_xml_hash {
    my $self = shift;
    return {
        id => $self->relationship_id->id,
        part1 => $self->part1->id,
        part2 => $self->part2->id,
        type => $self->type->relationship_type,
        nav => $self->nav
    };
}

sub user {
    my $self=shift;
    if ($self->relationship_id){
        # gets called after object is created and has an object_id
        return $self->relationship_id->user(@_);
    } else {
        # only gets called by before_create triggers
        return $self->{user};
    }
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

