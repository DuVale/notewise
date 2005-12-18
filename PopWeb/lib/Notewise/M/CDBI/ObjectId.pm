package Notewise::M::CDBI::ObjectId;

use strict;

__PACKAGE__->has_a(user=>'Notewise::M::CDBI::User');

sub object {
    my $self = shift;
    if($self->type eq 'kernel'){
        return Notewise::M::CDBI::Kernel->retrieve($self->id);
    } elsif($self->type eq 'note'){
        return Notewise::M::CDBI::Note->retrieve($self->id);
    } elsif($self->type eq 'relationship'){
        return Notewise::M::CDBI::Relationship->retrieve($self->id);
    } else {
        die "Unknown object type ".$self->type;
    }
}

=head1 NAME

Notewise::M::CDBI::ObjectId - CDBI Model Component Table Class

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

