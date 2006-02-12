use Test::More tests => 16;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::M::CDBI::Kernel');
use Data::Dumper;
use strict;
use warnings;

# setup

# delete any stale test users
map $_->delete, Notewise::M::CDBI::User->search({email=>'fred@flintstone.com'});
map $_->delete, Notewise::M::CDBI::User->search({email=>'fred2@flintstone.com'});

my $user = Notewise::M::CDBI::User->create({name=>'Fred Flintstone1',email=>'fred@flintstone.com',password=>'password',username=>'fred'});
my $user2 = Notewise::M::CDBI::User->create({name=>'Fred Flintstone2',email=>'fred2@flintstone.com',password=>'password',username=>'fred2'});
my $kernel = Notewise::M::CDBI::Kernel->create({name=>'foo',user=>$user->id});

#tests

isnt($kernel->object_id, 0, 'object exists');
$kernel = Notewise::M::CDBI::Kernel->retrieve($kernel->object_id->id);
is($kernel->user, $user->id, 'user id is correct after kernel rehydration');


# Test that when a kernel is deleted, so is the object_id

my $kernel_to_delete = Notewise::M::CDBI::Kernel->create({name=>'foo',user=>$user->id});
my $kernel_id = $kernel_to_delete->object_id->id();
$kernel_to_delete->delete;
my $object_id = Notewise::M::CDBI::ObjectId->retrieve($kernel_id);
is($object_id,undef,'object_id is deleted when kernel is deleted');

# test url generation

is($kernel->relative_url, 'fred/foo','test relative_url');
$kernel->name('This is a name with  spaces ');
$kernel->update;
is($kernel->relative_url, 'fred/This_is_a_name_with__spaces','test relative_url 2 - spaces');
$kernel->name('This is a name with /slashes ');
$kernel->update;
is($kernel->relative_url, 'fred/This_is_a_name_with_%2Fslashes','test relative_url 3 - slashes');
$kernel->name('This is a name with ?question marks ');
$kernel->update;
is($kernel->relative_url, 'fred/This_is_a_name_with_%3Fquestion_marks','test relative_url 4 - question marks');
# test permissions
ok($kernel->has_permission($user,'view'), "users can view their own kernel");
ok($kernel->has_permission($user,'modify'), "users can modify their own kernel");
ok($kernel->has_permission($user,'delete'), "users can delete their own kernel");
ok(!$kernel->has_permission($user2,'view'), "other users can't view other users' kernels");
ok(!$kernel->has_permission($user2,'modify'), "other users can't view other users' kernels");
ok(!$kernel->has_permission($user2,'delete'), "other users can't view other users' kernels");


# test visible_relationships
my $kernel2 = Notewise::M::CDBI::Kernel->create({name=>'onfoo1',user=>$user});
my $kernel3 = Notewise::M::CDBI::Kernel->create({name=>'onfoo2',user=>$user});
my $note1 = Notewise::M::CDBI::Note->create({container_object=>$kernel->object_id,
                                             content=>'onfoo3',
                                             x=>10,
                                             y=>10,
                                             width=>10,
                                             height=>10,
                                             user=>$user});
my $kernel4 = Notewise::M::CDBI::Kernel->create({name=>'offfoo1',user=>$user});
my $note2 = Notewise::M::CDBI::Note->create({container_object=>$kernel4->object_id,
                                             content=>'offfoo2',
                                             x=>10,
                                             y=>10,
                                             width=>10,
                                             height=>10,
                                             user=>$user});
my $contained_object =
    Notewise::M::CDBI::ContainedObject->create({container_object=>$kernel->object_id,
                                                contained_object=>$kernel2->object_id,
                                                x=>10,
                                                y=>10,
                                                width=>10,
                                                height=>10});
my $contained_object2 =
    Notewise::M::CDBI::ContainedObject->create({container_object=>$kernel->object_id,
                                                contained_object=>$kernel3->object_id,
                                                x=>10,
                                                y=>10,
                                                width=>10,
                                                height=>10});

my $rel1 = Notewise::M::CDBI::Relationship->create({part1=>$kernel2->object_id,
                                                    part2=>$kernel3->object_id,
                                                    nav=>'non'});
my $rel2 = Notewise::M::CDBI::Relationship->create({part1=>$kernel2->object_id,
                                                    part2=>$note1->object_id,
                                                    nav=>'non'});
my $rel3 = Notewise::M::CDBI::Relationship->create({part1=>$kernel2->object_id,
                                                    part2=>$kernel4->object_id,
                                                    nav=>'non'});
my $rel4 = Notewise::M::CDBI::Relationship->create({part1=>$kernel2->object_id,
                                                    part2=>$note2->object_id,
                                                    nav=>'non'});


my @visible_rels = $kernel->visible_relationships;

is_deeply([sort (map $_->id, @visible_rels)],[sort($rel1->id,$rel2->id)]);

# cleanup
$user->delete;
$user2->delete;

# vim:ft=perl
