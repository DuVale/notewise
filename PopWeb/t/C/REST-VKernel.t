
use Test::More tests => 3;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::REST::ContainedObject');

ok( request('rest/containedobject')->is_success );

