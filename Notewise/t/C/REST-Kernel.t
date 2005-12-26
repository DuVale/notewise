use Test::More tests => 11;
use Test::XML;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::REST::Kernel');
use Test::WWW::Mechanize::Catalyst 'Notewise';
use Notewise::TestUtils;


my $mech;
my $user;

# login
($mech, $user) = login_user('test@tester.scottyallen.com','password');
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
my ($lastmodified) = $mech->content =~ /<kernel.+lastmodified="(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"/;

is_xml($mech->content,qq#<response><kernel name="harrypotter" created="2005-01-01 01:02:03" id="$kernel_id" lastmodified="$lastmodified" source="mysource" uri="myuri">
<containedObjects>
</containedObjects>
</kernel></response># );

# Try and get it back again

$mech->get_ok("/rest/kernel/$kernel_id");
is_xml($mech->content,qq#<response><kernel name="harrypotter" created="2005-01-01 01:02:03" id="$kernel_id" lastmodified="$lastmodified" source="mysource" uri="myuri">
<containedObjects>
</containedObjects>
</kernel></response># );

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
($lastmodified) = $mech->content =~ /<kernel.+lastmodified="(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})"/;
is_xml($mech->content,qq#<response><kernel name="fred" created="2004-02-03 02:03:04" id="$kernel_id" lastmodified="$lastmodified" source="anothersource" uri="anotheruri">
<containedObjects>
</containedObjects>
</kernel></response># );

$user->delete;
Notewise::M::CDBI::Kernel->retrieve($kernel_id)->delete;

# vim:ft=perl
