package PopWeb::M::CDBI::Relationship;

use strict;

__PACKAGE__->add_trigger(before_create => \&create_id);

__PACKAGE__->has_a(part1 => 'PopWeb::M::CDBI::ObjectId');
__PACKAGE__->has_a(part2 => 'PopWeb::M::CDBI::ObjectId');

sub create_id {
    my $self=shift;
    my $object_id = PopWeb::M::CDBI::ObjectId->create({type=>'relationship'});
    $self->_attribute_store(id => $object_id->id);
}

=head1 NAME

PopWeb::M::CDBI::Relationship - CDBI Model Component Table Class

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

