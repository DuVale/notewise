use Test::More tests => 2;
use_ok( Catalyst::Test, 'PopWeb' );

ok( request('/')->is_success );
