package Notewise::TestUtils;
use Notewise;
use Notewise::M::CDBI::User;

@EXPORT = qw(new_request login_user);

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


sub login_user {
    my ($email,$password)=@_;
    my $mech = Test::WWW::Mechanize::Catalyst->new;

    # login
    my $user = Notewise::M::CDBI::User->find_or_create({email=>$email,
                                                        password=>$password});
    $user->name('automated testing account');
    $user->update;
    $mech->get_ok("http://localhost/?email=$email&password=$password");
    return $mech, $user;
}

1;
