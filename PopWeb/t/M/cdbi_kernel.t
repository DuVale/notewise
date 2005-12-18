use Test::More tests => 10;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::M::CDBI::Kernel');

# setup
my $user = Notewise::M::CDBI::User->create({name=>'Fred Flintstone1',email=>'fred@flintstone.com',password=>'password'});
my $user2 = Notewise::M::CDBI::User->create({name=>'Fred Flintstone2',email=>'fred2@flintstone.com',password=>'password'});
my $kernel = Notewise::M::CDBI::Kernel->create({name=>'foo',user=>$user->id});

#tests

isnt($kernel->object_id, 0, 'object exists');
$kernel = Notewise::M::CDBI::Kernel->retrieve($kernel->id);
is($kernel->user, $user->id, 'user id is correct after kernel rehydration');

# test permissions
ok($kernel->has_permission($user,'view'), "users can view their own kernel");
ok($kernel->has_permission($user,'modify'), "users can modify their own kernel");
ok($kernel->has_permission($user,'delete'), "users can delete their own kernel");
ok(!$kernel->has_permission($user2,'view'), "other users can't view other users' kernels");
ok(!$kernel->has_permission($user2,'modify'), "other users can't view other users' kernels");
ok(!$kernel->has_permission($user2,'delete'), "other users can't view other users' kernels");

# cleanup
$user->delete;
$user2->delete;
$kernel->delete;

# vim:ft=perl
