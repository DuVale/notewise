
use Test::More tests => 3;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::QuicksearchChoice');

ok( request('quicksearchchoice')->is_success );

