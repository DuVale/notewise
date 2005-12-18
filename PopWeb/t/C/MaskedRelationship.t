
use Test::More tests => 3;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::MaskedRelationship');

ok( request('maskedrelationship')->is_success );

