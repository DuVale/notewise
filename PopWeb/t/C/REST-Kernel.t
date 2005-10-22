
use Test::More tests => 3;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::REST::Kernel');

ok( request('rest/kernel')->is_success );

