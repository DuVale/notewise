use Test::More tests => 6;
use Test::WWW::Mechanize::Catalyst 'Notewise';
use Notewise::TestUtils;
use_ok( Catalyst::Test, 'Notewise' );
use_ok('Notewise::C::Kernel');

my $mech = Test::WWW::Mechanize::Catalyst->new;
# login
my $user = Notewise::M::CDBI::User->find_or_create({email=>'test@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test@tester.scottyallen.com&password=password','login');
my $user_id=$user->id;

# create a dummy kernel
my $kernel = Notewise::M::CDBI::Kernel->create({user=>$user_id});
my $kernel_id = $kernel->id;

# try looking at a kernel
$req = new_request('GET', "http://localhost/kernel/view/$kernel_id");
$mech->request($req);
is($mech->status,200,'Status of GET is 200');

# try looking at another user's kernel
$mech = Test::WWW::Mechanize::Catalyst->new;
my $user2 = Notewise::M::CDBI::User->find_or_create({email=>'test2@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test2@tester.scottyallen.com&password=password','login');

$req = new_request('GET', "http://localhost/kernel/view/$kernel_id");
$mech->request($req);
is($mech->status,403,'Status of GET is 403');


# cleanup
$user->delete;
$user2->delete;
$kernel->delete;

# vim:ft=perl
