
use Test::More tests => 5;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::REST::VKernel');

ok( request('/rest/vkernel')->is_success );

my $req = request('/rest/vkernel/add?container_object=1&x=100&y=200&zoomlevel=300&collapsed=1');
ok( $req->is_success );
my ($kernel_id) = $req->content =~ /<kernel.+id="(\d+)"/;
diag("kernel_id: $kernel_id");
$req = request("/rest/vkernel/xml/1/$kernel_id");

ok( $req->content =~ m#<visiblekernel collapsed="1" container_id="1" x="100" y="200" zoomlevel="300">
\s+<kernel name="" created="\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}" id="$kernel_id" lastModified="\d+" source="" uri="" />
</visiblekernel># );
