
use Test::More tests => 3;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::MaskedRelationship');

ok( request('maskedrelationship')->is_success );

