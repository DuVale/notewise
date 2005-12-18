use Test::More tests => 11;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::REST::Kernel');
use Test::WWW::Mechanize::Catalyst 'Notewise';
use Notewise::TestUtils;


my $mech = Test::WWW::Mechanize::Catalyst->new;
# login
my $user = Notewise::M::CDBI::User->find_or_create({email=>'test@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test@tester.scottyallen.com&password=password');
my $user_id=$user->id;

#test create
$req = new_request('PUT', "http://localhost/rest/kernel",
                    {name=>'harrypotter',
                     uri=>'myuri',
                     source=>'mysource',
                     created=>'2005-01-01 01:02:03'});
$mech->request($req);

is($mech->status,201,'Status of PUT is 201');

my ($kernel_id) = $mech->content =~ /<kernel.+id="(\d+)"/;

$mech->content_like(qr#<kernel name="harrypotter" created="2005-01-01 01:02:03" id="$kernel_id" lastModified="\d+" source="mysource" uri="myuri">
\s+<containedObjects>
\s+</containedObjects>
\s+</kernel># );

# Try and get it back again

$mech->get_ok("/rest/kernel/$kernel_id");
$mech->content_like(qr#<kernel name="harrypotter" created="2005-01-01 01:02:03" id="$kernel_id" lastModified="\d+" source="mysource" uri="myuri">
\s+<containedObjects>
\s+</containedObjects>
\s+</kernel># );

# update it

$req = new_request('POST', "http://localhost/rest/kernel/$kernel_id",
                    {name=>'fred',
                     uri=>'anotheruri',
                     source=>'anothersource',
                     created=>'2004-02-03 02:03:04'});
$mech->request($req);
$mech->content_lacks('ERROR');
$mech->content_lacks('FORBIDDEN');

$mech->get_ok("/rest/kernel/$kernel_id");
$mech->content_like(qr#<kernel name="fred" created="2004-02-03 02:03:04" id="$kernel_id" lastModified="\d+" source="anothersource" uri="anotheruri">
\s+<containedObjects>
\s+</containedObjects>
\s+</kernel># );

$user->delete;
Notewise::M::CDBI::Kernel->retrieve($kernel_id)->delete;

# vim:ft=perl
