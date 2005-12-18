
use Test::More tests => 19;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::REST::Note');

ok( request('rest/note')->is_success );

use Test::WWW::Mechanize::Catalyst 'Notewise';

my $mech = Test::WWW::Mechanize::Catalyst->new;

# login
my $user = Notewise::M::CDBI::User->find_or_create({email=>'test@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test@tester.scottyallen.com&password=password');
my $user_id=$user->id;

my $req;

# setup some dummy kernels

$req = new_request('PUT', "http://localhost/rest/kernel",
                    {name=>'harrypotter',
                     uri=>'myuri',
                     source=>'mysource',
                     created=>'2005-01-01 01:02:03'});
$mech->request($req);
my ($kernel_id) = $mech->content =~ /<kernel.+id="(\d+)"/;

$req = new_request('PUT', "http://localhost/rest/kernel",
                    {name=>'harrypotter',
                     uri=>'myuri',
                     source=>'mysource',
                     created=>'2005-01-01 01:02:03'});
$mech->request($req);
my ($kernel2_id) = $mech->content =~ /<kernel.+id="(\d+)"/;

#test create

$req = new_request('PUT', "http://localhost/rest/note",
                    {container_object=>$kernel_id,
                     content=>"a test note\na new line",
                     source=>'myuri',
                     created=>'2005-01-01 01:02:03',
                     lastmodified=>'2005-02-02 03:04:05',
                     x=>100,
                     y=>200,
                     w=>300,
                     h=>400 });
$mech->request($req);

is($mech->status,201,'Status of PUT is 201');

my ($note_id) = $mech->content =~ /<note.+id="(\d+)"/;

$mech->content_like(qr#<response>
\s+<note id="\d+" container_object="$kernel_id" created="2005-01-01 01:02:03" h="400" lastmodified="\d+" source="myuri" w="300" x="100" y="200">a test note
a new line</note>
</response>#);

# Try and get it back again

$mech->get_ok("/rest/note/$note_id");
$mech->content_like(qr#<response>
\s+<note id="\d+" container_object="$kernel_id" created="2005-01-01 01:02:03" h="400" lastmodified="\d+" source="myuri" w="300" x="100" y="200">a test note
a new line</note>
</response>#);

# update it

$req = new_request('POST', "http://localhost/rest/note/$note_id",
                    {container_object=>$kernel2_id,
                     content=>"a test note\nwith a new line",
                     source=>'myuri2',
                     x=>500,
                     y=>600,
                     w=>700,
                     h=>800 });
$mech->request($req);
$mech->content_lacks('ERROR');
$mech->content_lacks('FORBIDDEN');

$mech->get_ok("/rest/note/$note_id");
$mech->content_like(qr#<response>
\s+<note id="$note_id" container_object="$kernel2_id" created="2005-01-01 01:02:03" h="800" lastmodified="\d+" source="myuri2" w="700" x="500" y="600">a test note
with a new line</note>
</response>#);

# TODO test attempt to update created or last modified

### Test permissions
# login a different user
$mech = Test::WWW::Mechanize::Catalyst->new; #wipe our cookies
my $user2 = Notewise::M::CDBI::User->create({email=>'test2@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test2@tester.scottyallen.com&password=password');
my $user2_id=$user2->id;

$req = new_request('PUT', "http://localhost/rest/note",
                    {container_object=>$kernel_id,
                     content=>"a test note\na new line",
                     source=>'myuri',
                     created=>'2005-01-01 01:02:03',
                     lastmodified=>'2005-02-02 03:04:05',
                     x=>100,
                     y=>200,
                     w=>300,
                     h=>400 });
$mech->request($req);
is($mech->status,403,'Status of PUT is 403');
$mech->content_is("FORBIDDEN", "adding notes to other users' kernels is forbidden");

$req = new_request('POST', "http://localhost/rest/note/$note_id",
                    {container_object=>$kernel_id,
                     content=>"a test note\nwith a new line",
                     source=>'myuri',
                     created=>'2005-01-01 01:02:03',
                     lastmodified=>'2005-02-02 03:04:05',
                     x=>100,
                     y=>200,
                     w=>300,
                     h=>500 });
$mech->request($req);
is($mech->status,403,'Status of POST is 403');
$mech->content_is("FORBIDDEN", "updating other users' notes is forbidden");

$req = new_request('DELETE', "http://localhost/rest/note/$note_id");
$mech->request($req);
is($mech->status,403,'Status of DELETE is 403');
$mech->content_is("FORBIDDEN", "deleting other users' notes is forbidden");

# Cleanup

$user->delete;
$user2->delete;
Notewise::M::CDBI::Note->retrieve($note_id)->delete;
Notewise::M::CDBI::Kernel->retrieve($kernel_id)->delete;
Notewise::M::CDBI::Kernel->retrieve($kernel2_id)->delete;

sub new_request {
    my($type,$url,$params) = @_;
    $req = new HTTP::Request($type, $url);
    if($params){
        $req->header('Content-Type' => 'application/x-www-form-urlencoded');
        my $content;
        foreach my $key (keys %$params){
            if($content){
                $content .= "&$key=$params->{$key}";
            } else {
                $content .= "$key=$params->{$key}";
            }
        }
        $req->content($content);
        $req->header('Content-Length' => length($content));
    }
    return $req;
}
