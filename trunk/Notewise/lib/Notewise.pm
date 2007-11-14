package Notewise;

use Carp;

#$SIG{__DIE__} = sub {
#    Carp::confess(shift);
#};

use strict;
use YAML ();
use Catalyst qw/FormValidator
                Session
                Session::State::Cookie
                Session::Store::FastMmap
                Authentication
                Authentication::Credential::Password
                Authentication::Store::DBIC/;

our $VERSION = '0.01';

#use Data::Dumper;
#die Dumper(YAML::LoadFile( __PACKAGE__->path_to('config.yml') ) );
__PACKAGE__->config( YAML::LoadFile( __PACKAGE__->path_to('config.yml') ) );

__PACKAGE__->config->{authentication}->{dbic} = {
               user_class           => 'DBIC::User',
               user_field           => 'username',
               password_field       => 'password',
               password_type        => 'hashed',
               password_hash_type   => 'MD5',
           };
# make all cookies session cookies (expire when the browser closes).
__PACKAGE__->config->{session}->{cookie_expires} = 0;

__PACKAGE__->config->{session}->{expires} = 60*60*24*7; # set session to expire after a week

# Allow us to use catalyst to serve static content, or serve it via apache, with a Static config toggle
if(__PACKAGE__->config->{Static}){
    __PACKAGE__->setup( qw/Static::Simple/ );
    __PACKAGE__->config->{static}->{ignore_extensions} = [];
    __PACKAGE__->config->{static}->{no_logs} = 1;
} else {
    __PACKAGE__->setup();
}

#use Carp;
#__PACKAGE__->model('DBIC')->schema->storage->debugcb(sub {
#        my $message = $_[1];
#        my @lines = split /\n/,Carp::longmess($message);
#        @lines = grep !/^\s*DBIx/, @lines;
#        @lines = grep !/^\s*Catalyst/, @lines;
#        $message = join "\n",@lines[0..4];
#        #$message = join "\n",@lines;
#        warn "$message\n\n";
##        open TRACE, '>>/tmp/trace.out';
##        print TRACE "$message\n\n";
##        close TRACE;
#    });

use Data::Dumper;
#$Data::Dumper::Freezer = '_dumper_hook';
$Data::Dumper::Maxdepth = 3;
sub _dumper_hook {
    $_[0] = bless {
        _column_data => ${%{ $_[0] }}{_column_data},
        _relationship_data => ${%{ $_[0] }}{_relationship_data},
    }, ref($_[0]);
}

sub default : Private {
    my ( $self, $c, $username, $name, $id ) = @_;
    if($name ne ''|| $id) {
        $c->detach('/kernel/view',[$username,$name,$id]);
    } elsif ($username){
        $c->detach('/user/home',[$username]);
    } else {
        $c->detach('/user/home',[$c->user_object->username]);
    }
        #$c->stash->{template}='home.tt';
}

sub begin : Private {
    my ( $self, $c ) = @_;
    warn "DBD::mysql version: " . $DBD::mysql::VERSION;
    if($self->config->{'BaseUrl'}){
        $c->req->base( new URI($self->config->{'BaseUrl'} ) );
    }
    $c->session_expires(0);
    $c->model('CDBI')->clear_object_index();
}

sub end : Private {
    my ( $self, $c ) = @_;
    $c->forward('Notewise::V::TT') unless $c->res->output || $c->res->location;
}

#Handles user authentication.  If the user is not logged in, checks for the
#username and password parameters.  If they're present, it logs in the user and
#continues with the requested action.  Otherwise redirects the user to the
#login page.
sub auto : Local {
    my ($self, $c) = @_;

    # skip authentication for the admin area - we do that with htpasswd
    if($c->req->path =~ m#^admin#){
        return 1;
    }

    # skip authentication for public areas
    if($c->req->path =~ m#^tutorial#){
        return 1;
    }

    # check to see if they're already logged in
    if ($c->user_exists){
        return 1;
    }

    # check to see if they have a persistent authentication cookie
    if (my $auth_cookie = $c->req->cookie('persistent_auth')){
        my ($username, $hash) = split /:/, $auth_cookie->value;
        my $user = $c->get_user($username);
        if($auth_cookie->value eq $user->authentication_hash){
            $c->set_authenticated($user);
            return 1;
        }
    }
    
    # try to log them in if we can
    my $username = $c->req->params->{username};
    my $password = $c->req->params->{password};
    unless ($username && $password
        && $c->login($username, $password) ){
        # if they don't login successfully, forward to display the login page,
        # and break the auto chain
        $c->forward('/user/login');
        return 0;
    }

    #they're logged in

    # see if we need to give them a persistent cookie
    if($c->req->params->{remember_me}){
        $c->res->cookies->{persistent_auth} = { value => $c->user->user->authentication_hash,
                                                expires => '+36M' };
    }
    unless($c->req->path){
        $c->res->redirect('/'.$c->user->user->username);
        return 0;
    } else {
        return 1;
    }

}

sub logout : Local {
    my ($self, $c) = @_;
    use Data::Dumper;
    $Data::Dumper::Maxdepth=2;
    warn Dumper($c);

    # $c->logout is borked
    delete @{ $c->session }{qw/__user __user_store/};

    $c->res->cookies->{persistent_auth} = { value => '',
                                          expires => '-1d' };

    $c->res->redirect($c->uri_for('/'));
}

# Allow us to toggle catalyst debug output via the config file
sub debug {
    my $self = shift;
    return $self->config->{Debug};
}

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
