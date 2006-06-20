package Notewise::SchemaLoader::DBIC::User;

use base qw/DBIx::Class/;

__PACKAGE__->load_components(qw/PK::Auto::MySQL ResultSetManager Core/);
__PACKAGE__->table('user');
__PACKAGE__->add_columns(qw/id name email username password user_type/);
__PACKAGE__->set_primary_key('id');

sub foo : ResultSet {
    warn "Foo!!!";
}

sub bar {
    warn "Bar!!!";
}

1;
