package Notewise::SchemaLoader::DBIC::ContainedObject;

use base qw/DBIx::Class/;

__PACKAGE__->load_components(qw/ResultSetManager Core/);
__PACKAGE__->table('contained_object');
__PACKAGE__->add_columns(qw/id container_object contained_object x y width height collapsed/);
__PACKAGE__->set_primary_key('id');
__PACKAGE__->belongs_to(container_object => 'Notewise::SchemaLoader::DBIC::ObjectId');
__PACKAGE__->belongs_to(contained_object => 'Notewise::SchemaLoader::DBIC::ObjectId');

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

sub has_permission {
    my ($self,$user,$action) = @_;
    if($action eq 'delete'){
        return $self->container_object->has_permission($user,'modify');
    } else {
        return $self->container_object->has_permission($user,$action);
    }
}

sub contained_kernel {
    my $self = shift;

    return $self->{__contained_kernel} if $self->{__contained_kernel};

    return $self->{__contained_kernel} = $self->result_source->schema->resultset('Kernel')->find($self->get_column('contained_object'),{prefetch => {object_id=>'user'}});
}

sub container_kernel {
    my $self = shift;
    return $self->result_source->schema->resultset('Kernel')->find($self->get_column('container_object'));
}


1;