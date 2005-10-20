package PopWeb::M::CDBI::ContainedObject;

use strict;

__PACKAGE__->has_a(contained_object => 'PopWeb::M::CDBI::ObjectId');

sub contained_kernel {
    my $self = shift;
    return $self->contained_object->object;
}

=head1 NAME

PopWeb::M::CDBI::ContainedObject - CDBI Model Component Table Class

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

