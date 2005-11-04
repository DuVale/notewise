
use Test::More tests => 3;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::User');

ok( request('user')->is_success );

