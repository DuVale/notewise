
use Test::More tests => 3;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::Preference');

ok( request('preference')->is_success );

