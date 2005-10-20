
use Test::More tests => 3;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::ObjectId');

ok( request('objectid')->is_success );

