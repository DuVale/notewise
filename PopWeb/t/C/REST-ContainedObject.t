use Test::More tests => 14;
use Test::WWW::Mechanize::Catalyst 'PopWeb';
use_ok('PopWeb::C::REST::ContainedObject');
use_ok('PopWeb::C::REST::VKernel');

my $mech = Test::WWW::Mechanize::Catalyst->new;
# login
my $user = PopWeb::M::CDBI::User->find_or_create({email=>'test@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test@tester.scottyallen.com&password=password');
my $user_id=$user->id;

my $container = PopWeb::M::CDBI::Kernel->create({user=>$user_id});
my $container_id = $container->id;

$req = new_request('PUT', "http://localhost/rest/vkernel",
                    {container_object=>$container_id,
                     x=>100,
                     y=>200,
                     width=>300,
                     height=>400,
                     collapsed=>1});
$mech->request($req);
$mech->content_like(qr/<kernel.+id="(\d+)"/);

my ($kernel_id) = $mech->content =~ /<kernel.+id="(\d+)"/;

isnt($kernel_id,0,"kernel id isn't zero");

$mech->get_ok("http://localhost/rest/vkernel/$container_id/$kernel_id");
$mech->content_like(qr#<visiblekernel collapsed="1" contained_object="$kernel_id" container_object="$container_id" height="400" width="300" x="100" y="200">
\s+<kernel name="" created="\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}" id="$kernel_id" lastModified="\d+" source="" uri="" user="$user_id" />
\s+</visiblekernel># );
diag($mech->content);

$req = new_request('POST', "http://localhost/rest/vkernel/$container_id/$kernel_id",
                    { container_object=>$container_id,
                      contained_object=>$kernel_id,
                      x=>400,
                      y=>500,
                      width=>600,
                      height=>700,
                      collapsed=>0});
$mech->request($req);
is($mech->status,200,'Status of POST is 200');
$mech->content_is('OK');

### Test permissions
# login a different user
$mech = Test::WWW::Mechanize::Catalyst->new; #wipe our cookies
my $user2 = PopWeb::M::CDBI::User->create({email=>'test2@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test2@tester.scottyallen.com&password=password');
my $user2_id=$user2->id;

$req = new_request('PUT', "http://localhost/rest/vkernel",
                    {container_object=>$container_id,
                     x=>100,
                     y=>200,
                     width=>300,
                     height=>400,
                     collapsed=>1});
$mech->request($req);
is($mech->status,403,'Status of PUT is 403');
$mech->content_is("FORBIDDEN", "adding to other users' kernels is forbidden");

$req = new_request('POST', "http://localhost/rest/vkernel/$container_id/$kernel_id",
                    {container_object=>$container_id,
                     contained_object=>$kernel_id,
                     x=>100,
                     y=>200,
                     width=>300,
                     height=>400,
                     collapsed=>1});
$mech->request($req);
is($mech->status,403,'Status of POST is 403');
$mech->content_is("FORBIDDEN", "updating other users' kernels is forbidden");

$user->delete;
$user2->delete;
$container->delete;
PopWeb::M::CDBI::Kernel->retrieve($kernel_id)->delete;
map $_->delete, PopWeb::M::CDBI::ContainedObject->search(contained_object=>kernel_id);

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
