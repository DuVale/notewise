package Notewise::M::CDBI::User;

use strict;
use Digest::MD5;

__PACKAGE__->add_trigger(before_delete => sub {
     my $self = shift;
     $self->clear;
});

# encrypt the password on set
__PACKAGE__->add_trigger(before_set_password => sub {
    my ($self,$value,$valueshash)=@_;
    if (defined($valueshash->{password})) {
        $valueshash->{password} = Digest::MD5::md5_hex($value);
    }
});

__PACKAGE__->add_trigger(after_create => sub {
    my $self = shift;

    # create starting kernel
    my $kernel = Notewise::M::CDBI::Kernel->insert({name=>'',
                                                    user=>$self});

    # Create sandbox
    my $sandbox = Notewise::M::CDBI::ObjectId->insert({type=>'sandbox',
                                                       user=>$self});
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

sub kernels {
    my $self = shift;
    my @kernels = Notewise::M::CDBI::Kernel->search_kernels_for_user($self->id);
    return @kernels;
}

sub notes {
    my $self = shift;
    my @notes = Notewise::M::CDBI::Note->search_notes_for_user($self->id);
    return @notes;
}

sub relationships {
    my $self = shift;
    my @notes = Notewise::M::CDBI::->search_notes_for_user($self->id);
    return @notes;
}

# Creates a copy of this user and all of their objects and returns it, with the new username and email
# given (since all usernames and emails have to be unique);
sub fullcopy {
    my $self = shift;
    my $username = shift;
    my $email = shift;

    my $user = $self->copy({email=>$email,
                            username=>$username});

    # maps from old user's object ids to new user object ids
    my %object_map;
    foreach my $old_kernel ($self->kernels){
        my $new_kernel = $old_kernel->copy({user=>$user});
        $object_map{$old_kernel->object_id->id} = $new_kernel->object_id->id;
    }

    # have to do second pass here, so we're sure that all the container objects
    # have been created first.
    foreach my $old_kernel ($self->kernels){
        my @contained = Notewise::M::CDBI::ContainedObject->search(contained_object => $old_kernel->object_id->id);
        foreach my $old_contained (@contained){
            my $new_contained = $old_contained->copy({container_object=>$object_map{$old_contained->container_object},
                                                      contained_object=>$object_map{$old_contained->contained_object}
                                                    });
        }
     }

    foreach my $old_note ($self->notes){
        my $new_note = $old_note->copy({user=>$user, container_object=>$object_map{$old_note->container_object}});
        $object_map{$old_note->object_id->id} = $new_note->object_id->id;
    }

    foreach my $old_object ($self->notes, $self->kernels){
        my @old_rels = Notewise::M::CDBI::Relationship->search(part1=>$old_object->object_id);
        push @old_rels, Notewise::M::CDBI::Relationship->search(part2=>$old_object->object_id);
        foreach my $old_rel (@old_rels) {
            # we see every relationship twice, so skip it if we've already seen it
            next if $object_map{$old_rel->relationship_id->id};
            my $new_rel = $old_rel->copy({part1=>$object_map{$old_rel->part1},
                                          part2=>$object_map{$old_rel->part2},
                                          user=>$user,
                                        });
            my $new_rel_id = $new_rel->relationship_id;
            $object_map{$old_rel->relationship_id->id} = $new_rel_id;
        }
    }
    return $user;
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

