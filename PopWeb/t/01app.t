use Test::More tests => 4;
use Test::WWW::Mechanize::Catalyst 'Notewise';

my $mech = Test::WWW::Mechanize::Catalyst->new;
$mech->get_ok('http://localhost/');

# XXX this probably will change in the future, as not everything will require you to login
$mech->content_contains('Login',"check we get a login page when we're not logged in");

# test login
my $user = Notewise::M::CDBI::User->create({email=>'test@tester.scottyallen.com',
                                          password=>'password',
                                          name=>'automated testing account'});
$mech->get_ok('http://localhost/?email=test@tester.scottyallen.com&password=password');
my $user_id=$user->id;

$mech->content_contains('You might want to do one of the following', 'test login');

$user->delete;
