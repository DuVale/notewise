use Test::More tests => 3;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::M::CDBI::Note');

# Test that when a note is deleted, so is the object_id

my $kernel = Notewise::M::CDBI::Kernel->create({name=>'foo'});
my $note = Notewise::M::CDBI::Note->create({content=>'bar',container_object=>$kernel->object_id});
my $note_id = $note->object_id->id();
$note->delete;
my $object_id = Notewise::M::CDBI::ObjectId->retrieve($note_id);
is($object_id,undef,'object_id is deleted when note is deleted');

$kernel->delete;

# vim:ft=perl
