package Notewise::SchemaLoader::DBIC::ObjectId;

use base qw/DBIx::Class/;

__PACKAGE__->load_components(qw/PK::Auto::MySQL Core/);
__PACKAGE__->table('object_id');
__PACKAGE__->add_columns(qw/id user type/);
__PACKAGE__->set_primary_key('id');
__PACKAGE__->belongs_to(user => 'Notewise::SchemaLoader::DBIC::User');
__PACKAGE__->might_have(kernel => 'Notewise::SchemaLoader::DBIC::Kernel', 'object_id');
#__PACKAGE__->might_have(note => 'Notewise::SchemaLoader::DBIC::Note');
#__PACKAGE__->might_have(relationship => 'Notewise::SchemaLoader::DBIC::Relationship');

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
    } elsif($self->type eq 'sandbox'){
        $object = $self;
    } else {
        Carp::confess "Unknown object type ".$self->type." for object ".$self->id;
    }
    return $self->{__object} = $object;
}

sub has_permission {
    my ($self, $user_id, $action) = @_;

    die "invalid action" unless grep $action eq $_, qw(view modify delete);
    return 0 unless $self->user;
    if ($user_id == $self->user->id){
        return 1;
    }
    #TODO add support for permissions for other users than the owner
    return 0;
}

1;
