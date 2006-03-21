package Notewise::M::CDBI::ObjectId;

use strict;
use Carp;

__PACKAGE__->has_a(user=>'Notewise::M::CDBI::User');

sub object {
    my $self = shift;

    # check to see if we've cached the object
    return $self->{__object} if $self->{__object};

    my $object;
    if($self->type eq 'kernel'){
        $object = Notewise::M::CDBI::Kernel->retrieve($self->id);
    } elsif($self->type eq 'note'){
        $object = Notewise::M::CDBI::Note->retrieve($self->id);
    } elsif($self->type eq 'relationship'){
        $object = Notewise::M::CDBI::Relationship->retrieve($self->id);
    } else {
        Carp::confess "Unknown object type ".$self->type;
    }
    return $self->{__object} = $object;
}

sub has_permission {
    my ($self, $user, $action) = @_;

    # hydrate user if necessary
    $user = Notewise::M::CDBI::User->retrieve($user) unless ref $user;
    die "invalid action" unless grep $action eq $_, qw(view modify delete);
    return 0 unless $self->user;
    if ($user->id == $self->user->id){
        return 1;
    }
    #TODO add support for permissions for other users than the owner
    return 0;
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

