
use Test::More tests => 14;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::REST::Kernel');


use Test::WWW::Mechanize::Catalyst 'PopWeb';
use_ok('PopWeb::C::REST::VKernel');

my $mech = Test::WWW::Mechanize::Catalyst->new;
# login
my $user = PopWeb::M::CDBI::User->create({email=>'test@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test@tester.scottyallen.com&password=password');
my $user_id=$user->id;

$mech->get_ok('rest/kernel');

$mech->get_ok('/rest/kernel/add?name=harrypotter&uri=myuri&source=mysource&created=2005-01-01 01:02:03');

my ($kernel_id) = $mech->content =~ /<kernel.+id="(\d+)"/;

$mech->content_like(qr#<kernel name="harrypotter" created="2005-01-01 01:02:03" id="$kernel_id" lastModified="\d+" source="mysource" uri="myuri">
\s+<containedObjects>
\s+</containedObjects>
</kernel># );

$mech->get_ok("/rest/kernel/xml/$kernel_id");
$mech->content_like(qr#<kernel name="harrypotter" created="2005-01-01 01:02:03" id="$kernel_id" lastModified="\d+" source="mysource" uri="myuri">
\s+<containedObjects>
\s+</containedObjects>
</kernel># );

$mech->get_ok("/rest/kernel/update/$kernel_id?name=fred&uri=anotheruri&source=anothersource&created=2004-02-03 02:03:04");
$mech->content_lacks('ERROR');
$mech->content_lacks('FORBIDDEN');

$mech->get_ok("/rest/kernel/xml/$kernel_id");
$mech->content_like(qr#<kernel name="fred" created="2004-02-03 02:03:04" id="$kernel_id" lastModified="\d+" source="anothersource" uri="anotheruri">
\s+<containedObjects>
\s+</containedObjects>
</kernel># );

$user->delete;
PopWeb::M::CDBI::Kernel->retrieve($kernel_id)->delete;
