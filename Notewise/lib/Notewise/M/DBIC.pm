package Notewise::M::DBIC;

use strict;
use base 'Catalyst::Model::DBIC::Schema';

#__PACKAGE__->config(
#    schema_class => 'Notewise::SchemaLoader::DBIC',
#    connect_info => [
#        'dbi:mysql:notewise_beta',
#        'root',
#        '',
#        { AutoCommit => 1 },
#    ],
#);

=head1 NAME

Notewise::M::DBIC - Catalyst DBIC Schema Model

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

L<Catalyst::Model::DBIC::Schema> Model using L<DBIx::Class::Schema::Loader>
generated Schema: L<Notewise::SchemaLoader::DBIC>

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software, you can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;

