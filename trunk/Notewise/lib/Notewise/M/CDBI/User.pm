package Notewise::M::CDBI::User;

use strict;
use Digest::MD5;

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
    # delete kernels first, as they have cascaded deletes to other objects. If
    # we don't do this, then we get errors trying to delete objects that have
    # already been deleted, because we try to delete them twice (once as part
    # of the cascade, and once because we found them in the search).
    my @kernels = Notewise::M::CDBI::ObjectId->search(user => $self->id, type=>'kernel');
    foreach my $object_id (@kernels){
        next if ref($object_id) =~ /Has::Been::Deleted/;
        if($object_id->object){
            $object_id->object->delete;
        } else {
            $object_id->delete;
        }
    }

    # delete everything else
    my @object_ids = Notewise::M::CDBI::ObjectId->search(user => $self->id);
    foreach my $object_id (@object_ids){
        if($object_id->object){
            $object_id->object->delete;
        } else {
            $object_id->delete;
        }
    }
}

# returns true if the given password matches the user's password
sub check_password {
    my ($self, $password) = @_;
    return $self->password eq Digest::MD5::md5_hex($password); #XXX this will change when passwords get encrypted
}

sub authentication_hash {
    my $self = shift;
    return $self->username . ':' . Digest::MD5::md5_hex("s3kr3tw0rd".$self->username);
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

