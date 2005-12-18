use Test::More tests => 25;
use Test::WWW::Mechanize::Catalyst 'Notewise';
use_ok('Notewise::C::REST::ContainedObject');
use_ok('Notewise::C::REST::VKernel');

my $mech = Test::WWW::Mechanize::Catalyst->new;
# login
my $user = Notewise::M::CDBI::User->find_or_create({email=>'test@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test@tester.scottyallen.com&password=password');
my $user_id=$user->id;

# create a dummy kernel
my $container = Notewise::M::CDBI::Kernel->create({user=>$user_id});
my $container_id = $container->id;

# Create a contained object
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

# Try updating it

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
my $user2 = Notewise::M::CDBI::User->create({email=>'test2@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test2@tester.scottyallen.com&password=password');
my $user2_id=$user2->id;

# Try adding to a kernel that isn't owned by this user
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

# Try modifying a kernel that isn't owned by this user
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
$mech->content_is("FORBIDDEN", "updating other users' contained objects is forbidden");

# Try adding someone else's kernel to your own kernel
my $container2 = Notewise::M::CDBI::Kernel->create({user=>$user2_id});
my $container2_id = $container2->id;
$req = new_request('PUT', "http://localhost/rest/vkernel",
                    {container_object=>$container2_id,
                     contained_object=>$kernel_id,
                     x=>100,
                     y=>200,
                     width=>300,
                     height=>400,
                     collapsed=>1});
$mech->request($req);
is($mech->status,403,'Status of PUT is 403');
$mech->content_is("FORBIDDEN", "adding someone else's kernel to your own is forbidden (currently)");
$container2->delete;

# test view permissions
$req = new_request('GET', "http://localhost/rest/vkernel/$container_id/$kernel_id");
$mech->request($req);
is($mech->status,403,'Status of GET is 403');
$mech->content_is("FORBIDDEN", "viewing other users' contained objects is forbidden");

# test deletion permissions
$req = new_request('DELETE', "http://localhost/rest/vkernel/$container_id/$kernel_id");
$mech->request($req);
is($mech->status,403,'Status of DELETE is 403');
$mech->content_is("FORBIDDEN", "deleting other users' kernels is forbidden");

### test allowed deletion
$mech = Test::WWW::Mechanize::Catalyst->new; #wipe our cookies
$mech->get_ok('http://localhost/?email=test@tester.scottyallen.com&password=password','login user 1 again');
$req = new_request('DELETE', "http://localhost/rest/vkernel/$container_id/$kernel_id");
$mech->request($req);
is($mech->status,200,'Status of DELETE is 200');
$mech->content_is("OK", "delete our own kernel");

# try getting it again
$req = new_request('GET', "http://localhost/rest/vkernel/$container_id/$kernel_id");
$mech->request($req);
is($mech->status,404,'Status of GET is 404');
$mech->content_is("ERROR", "object is truely deleted");

# Cleanup

$user->delete;
$user2->delete;
$container->delete;
map $_->delete, Notewise::M::CDBI::ContainedObject->search(contained_object=>kernel_id);

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

# vim:ft=perl
