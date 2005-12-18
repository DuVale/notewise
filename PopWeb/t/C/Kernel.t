
use Test::More tests => 3;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::Kernel');

ok( request('kernel')->is_success );

