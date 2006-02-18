package Notewise;

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

__PACKAGE__->config( YAML::LoadFile( __PACKAGE__->path_to('config.yml') ) );

__PACKAGE__->config->{authentication}->{dbic} = {
               user_class           => 'Notewise::M::CDBI::User',
               user_field           => 'email',
               password_field       => 'password',
               password_type        => 'clear', # XXX change this once we're stablish
           };

# Allow us to use catalyst to serve static content, or serve it via apache, with a Static config toggle
if(__PACKAGE__->config->{Static}){
    __PACKAGE__->setup( qw/Static::Simple/ );
    __PACKAGE__->config->{static}->{ignore_extensions} = [];
    __PACKAGE__->config->{static}->{no_logs} = 1;
} else {
    __PACKAGE__->setup();
}


sub default : Private {
    my ( $self, $c, $username, $name, $id ) = @_;
    if($name ne ''|| $id) {
        $c->detach('/kernel/view',[$username,$name,$id]);
    } elsif ($username){
        $c->detach('/user/home',[$username]);
    }
    $c->stash->{template}='home.tt';
}

sub begin : Private {
    my ( $self, $c ) = @_;
    if($self->config->{'BaseUrl'}){
        $c->req->base( new URI($self->config->{'BaseUrl'} ) );
    }
    $c->session_expires(0);
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

    # check to see if they're already logged in
    if ($c->user_exists){
        return 1;
    }
    
    # try to log them in if we can
    my $email = $c->req->params->{email};
    my $password = $c->req->params->{password};
    if ($email && $password
        && $c->login($email,$password) ){
            #they're logged in
            $c->res->redirect('/'.$c->user->user->username);
            return 0;
    }

    # otherwise forward to display the login page, and break the auto chain
    $c->forward('/user/login');
    return 0;
}

# Allow us to toggle catalyst debug output via the config file
sub debug {
    my $self = shift;
    return $self->config->{Debug};
}

=back

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
