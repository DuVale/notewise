use Test::More tests => 4;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::M::CDBI::Kernel');

my $user = Notewise::M::CDBI::User->create({name=>'Fred Flintstone1',email=>'fred@flintstone.com',password=>'password'});
my $kernel = Notewise::M::CDBI::Kernel->create({name=>'foo',user=>$user->id});

isnt($kernel->object_id, 0, 'object exists');

$kernel = Notewise::M::CDBI::Kernel->retrieve($kernel->id);

is($kernel->user, $user->id, 'user id is correct after kernel rehydration');

$user->delete;
$kernel->delete;
