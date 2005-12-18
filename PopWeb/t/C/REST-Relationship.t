use Test::More tests => 11;
use Test::XML;

use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::REST::Relationship');

ok( request('rest/relationship')->is_success );

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

# create a new relationship
# TODO need to test type stuff
$req = new_request('PUT', "http://localhost/rest/relationship",
                    {part1=> $kernel_id,
                     part2=> $kernel2_id,
                     nav => 'fromleft',
                     type => 'asdf'
                    });
$mech->request($req);
is($mech->status,201,'Status of PUT is 201');

my ($relationship_id) = $mech->content =~ /<relationship.*\sid="(\d+)"/;
is_xml($mech->content, qq#<response><relationship nav="fromleft" part1="$kernel_id" part2="$kernel2_id" id="$relationship_id" type="0" /></response>#);

# fetch it again

$req = new_request('GET', "http://localhost/rest/relationship/$relationship_id");
$mech->request($req);

is($mech->status,200,'Status of GET is 201');
is_xml($mech->content, qq#<response><relationship nav="fromleft" part1="$kernel_id" part2="$kernel2_id" id="$relationship_id" type="0" /></response>#);

# update it

$req = new_request('POST', "http://localhost/rest/relationship/$relationship_id",
                    {part1=> $kernel2_id,
                     part2=> $kernel_id,
                     nav => 'fromright',
                     type => 'asdfoo'
                    });
$mech->request($req);
is($mech->status,200,'Status of POST is 200');

$req = new_request('GET', "http://localhost/rest/relationship/$relationship_id");
$mech->request($req);

is($mech->status,200,'Status of GET is 200');
is_xml($mech->content, qq#<response><relationship nav="fromright" part1="$kernel2_id" part2="$kernel_id" id="$relationship_id" type="0" /></response>#);

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

# vim:filetype=perl
