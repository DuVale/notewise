
use Test::More tests => 8;
use_ok( Catalyst::Test, 'PopWeb' );
use_ok('PopWeb::C::REST::Note');

ok( request('rest/note')->is_success );

use Test::WWW::Mechanize::Catalyst 'PopWeb';

my $mech = Test::WWW::Mechanize::Catalyst->new;

# login
my $user = PopWeb::M::CDBI::User->find_or_create({email=>'test@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test@tester.scottyallen.com&password=password');
my $user_id=$user->id;

my $req;
#test create
$req = new_request('PUT', "http://localhost/rest/kernel",
                    {name=>'harrypotter',
                     uri=>'myuri',
                     source=>'mysource',
                     created=>'2005-01-01 01:02:03'});
$mech->request($req);
my ($kernel_id) = $mech->content =~ /<kernel.+id="(\d+)"/;

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
