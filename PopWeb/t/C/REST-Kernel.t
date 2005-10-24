
use Test::More tests => 11;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::REST::Kernel');

ok( request('rest/kernel')->is_success );

my $req = request('/rest/kernel/add?name=harrypotter&uri=myuri&source=mysource&created=2005-01-01 01:02:03');
ok( $req->is_success );

my ($kernel_id) = $req->content =~ /<kernel.+id="(\d+)"/;
ok( $req->is_success );
ok( $req->content =~ m#<kernel name="harrypotter" created="2005-01-01 01:02:03" id="$kernel_id" lastModified="\d+" source="mysource" uri="myuri">
\s+<containedObjects>
\s+</containedObjects>
</kernel># );

$req = request("/rest/kernel/xml/$kernel_id");
ok( $req->is_success );
ok( $req->content =~ m#<kernel name="harrypotter" created="2005-01-01 01:02:03" id="$kernel_id" lastModified="\d+" source="mysource" uri="myuri">
\s+<containedObjects>
\s+</containedObjects>
</kernel># );

$req = request("/rest/kernel/update/$kernel_id?name=fred&uri=anotheruri&source=anothersource&created=2004-02-03 02:03:04");
ok( $req->is_success );

$req = request("/rest/kernel/xml/$kernel_id");
ok( $req->is_success );
ok( $req->content =~ m#<kernel name="fred" created="2004-02-03 02:03:04" id="$kernel_id" lastModified="\d+" source="anothersource" uri="anotheruri">
\s+<containedObjects>
\s+</containedObjects>
</kernel># );
