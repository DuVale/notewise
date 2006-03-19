package Notewise::M::CDBI::ContainedObject;

use strict;

__PACKAGE__->has_a(contained_object => 'Notewise::M::CDBI::ObjectId');
__PACKAGE__->has_a(container_object => 'Notewise::M::CDBI::ObjectId');

__PACKAGE__->add_trigger(after_delete => sub {
     my $self = shift;

     # delete all the related stuff
     unless($self->contained_object->object->notes ||
            $self->contained_object->object->relationships ||
            $self->contained_object->object->parents ||
            $self->contained_object->object->children ||
            defined $self->contained_object->object->name){
         $self->contained_object->object->delete;
     }
});

sub to_xml_hash_deep {
    my $self = shift;
    my $base_url = shift;
    return {
        x=>$self->x,
        y=>$self->y,
        width=>$self->width,
        height=>$self->height,
        collapsed=>$self->collapsed,
        container_object=>$self->container_object->id,
        contained_object=>$self->contained_object->id,
        kernel=>[$self->contained_object->object->to_xml_hash_shallow($base_url)],
    };
}

sub contained_kernel {
    my $self = shift;
    return $self->contained_object->object;
}

sub container_kernel {
    my $self = shift;
    return $self->container_object->object;
}

sub has_permission {
    my ($self,$user,$action) = @_;
    if($action eq 'delete'){
        return $self->container_object->has_permission($user,'modify');
    } else {
        return $self->container_object->has_permission($user,$action);
    }
}

=head1 NAME

Notewise::M::CDBI::ContainedObject - CDBI Model Component for contained_object table

=head1 SYNOPSIS

=head1 DESCRIPTION

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

Copyright Scotty Allen.  All rights reserved.

=cut

1;

