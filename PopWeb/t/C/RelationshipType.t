
use Test::More tests => 3;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::RelationshipType');

ok( request('relationshiptype')->is_success );

