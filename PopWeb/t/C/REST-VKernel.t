use Test::More tests => 16;
use Test::WWW::Mechanize::Catalyst 'PopWeb';
use_ok('PopWeb::C::REST::VKernel');

my $mech = Test::WWW::Mechanize::Catalyst->new;
# login
my $user = PopWeb::M::CDBI::User->create({email=>'test@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test@tester.scottyallen.com&password=password');
my $user_id=$user->id;

my $container = PopWeb::M::CDBI::Kernel->create({user=>$user_id});
my $container_id = $container->id;

$mech->get_ok('http://localhost/rest/vkernel');
$mech->get_ok("http://localhost/rest/vkernel/add?container_object=$container_id&x=100&y=200&width=300&height=400&collapsed=1");
$mech->content_like(qr/<kernel.+id="(\d+)"/);

my ($kernel_id) = $mech->content =~ /<kernel.+id="(\d+)"/;

isnt($kernel_id,0,"kernel id isn't zero");

$mech->get_ok("http://localhost/rest/vkernel/xml/$container_id/$kernel_id");
$mech->content_like(qr#<visiblekernel collapsed="1" container_id="$container_id" height="400" width="300" x="100" y="200">
\s+<kernel name="" created="\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}" id="$kernel_id" lastModified="\d+" source="" uri="" user="$user_id" />
</visiblekernel># );
$mech->get_ok("/rest/vkernel/update?container_object=$container_id&contained_object=$kernel_id&x=400&y=500&width=600&height=700&collapsed=0");
$mech->get_ok("/rest/vkernel/xml/$container_id/$kernel_id");
$mech->content_like( qr#<visiblekernel collapsed="0" container_id="$container_id" height="700" width="600" x="400" y="500">
\s+<kernel name="" created="\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}" id="$kernel_id" lastModified="\d+" source="" uri="" user="$user_id" />
</visiblekernel># );

use Data::Dumper;
### Test permissions
# login a different user
$mech = Test::WWW::Mechanize::Catalyst->new; #wipe our cookies
my $user2 = PopWeb::M::CDBI::User->create({email=>'test2@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test2@tester.scottyallen.com&password=password');
my $user2_id=$user2->id;

$mech->get_ok("http://localhost/rest/vkernel/add?container_object=$kernel_id&x=100&y=200&width=300&height=400&collapsed=1");
$mech->content_is("FORBIDDEN", "adding to other users' kernels is forbidden");

$mech->get_ok("/rest/vkernel/update?container_object=$container_id&contained_object=$kernel_id&x=400&y=500&width=600&height=700&collapsed=0");
$mech->content_is("FORBIDDEN", "updating other users' kernels is forbidden");

$user->delete;
$user2->delete;
$container->delete;
PopWeb::M::CDBI::Kernel->retrieve($kernel_id)->delete;
map $_->delete, PopWeb::M::CDBI::ContainedObject->search(contained_object=>kernel_id);
