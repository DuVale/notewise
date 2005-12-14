use Test::More tests => 6;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::M::CDBI::ObjectId');
use_ok('PopWeb::M::CDBI::User');

my $user = PopWeb::M::CDBI::User->create({name=>'Fred Flintstone2',email=>'fred@flintstone.com',password=>'password'});
my $object_id = PopWeb::M::CDBI::ObjectId->create({type=>'kernel',user=>$user->id});

ok($object_id->id > 0);
is($object_id->user,$user);
is($object_id->type,'kernel');

$user->delete;
$object_id->delete;
1;
