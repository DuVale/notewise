
use Test::More tests => 3;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::REST::VKernel');

ok( request('rest/vkernel')->is_success );

