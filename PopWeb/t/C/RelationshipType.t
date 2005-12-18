
use Test::More tests => 3;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::RelationshipType');

ok( request('relationshiptype')->is_success );

