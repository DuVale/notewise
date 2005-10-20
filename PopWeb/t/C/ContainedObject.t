
use Test::More tests => 3;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::ContainedObject');

ok( request('containedobject')->is_success );

