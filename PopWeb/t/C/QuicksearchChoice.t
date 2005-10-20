
use Test::More tests => 3;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::QuicksearchChoice');

ok( request('quicksearchchoice')->is_success );

