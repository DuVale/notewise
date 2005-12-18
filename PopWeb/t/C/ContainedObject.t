
use Test::More tests => 3;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::ContainedObject');

ok( request('containedobject')->is_success );

