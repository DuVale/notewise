
use Test::More tests => 3;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::ObjectId');

ok( request('objectid')->is_success );

