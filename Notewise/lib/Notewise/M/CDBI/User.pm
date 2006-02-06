package Notewise::M::CDBI::User;

use strict;

__PACKAGE__->add_trigger(before_delete => sub {
                             my $self = shift;
                             $self->clear;
                        });

sub kernel_count {
    my $self = shift;
    return scalar(Notewise::M::CDBI::ObjectId->search(user=>$self->id, type=>'kernel'));
}

sub note_count {
    my $self = shift;
    return scalar(Notewise::M::CDBI::ObjectId->search(user=>$self->id, type=>'note'));
}

sub relationship_count {
    my $self = shift;
    return scalar(Notewise::M::CDBI::ObjectId->search(user=>$self->id, type=>'relationship'));
}

# clears the kernels, notes, and relationships for this user
sub clear {
    my $self = shift;
    foreach my $object_id (Notewise::M::CDBI::ObjectId->search(user => $self->id)){
        if($object_id->object){
            $object_id->object->delete;
        } else {
            $object_id->delete;
        }
    }
}

=head1 NAME

Notewise::M::CDBI::User - CDBI Model Component Table Class

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

