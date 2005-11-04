use Test::More tests => 4;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::M::CDBI::Kernel');

my $user = PopWeb::M::CDBI::User->create({name=>'Fred Flintstone1',email=>'fred@flintstone.com',password=>'password'});
my $kernel = PopWeb::M::CDBI::Kernel->create({name=>'foo',user=>$user->id});

isnt($kernel->object_id, 0, 'object exists');

$kernel = PopWeb::M::CDBI::Kernel->retrieve($kernel->id);

is($kernel->user, $user->id, 'user id is correct after kernel rehydration');

$user->delete;
$kernel->delete;
