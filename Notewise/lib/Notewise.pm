package Notewise;

use strict;
use YAML ();
use Catalyst qw/FormValidator Session::FastMmap Authentication::CDBI/;
#use Catalyst qw/-Debug FormValidator Session::FastMmap Authentication::CDBI/;

our $VERSION = '0.01';

__PACKAGE__->config( YAML::LoadFile( __PACKAGE__->path_to('config.yml') ) );

# Allow us to use catalyst to serve static content, or serve it via apache, with a Static config toggle
if(__PACKAGE__->config->{Static}){
    __PACKAGE__->setup( qw/Static::Simple/ );
    __PACKAGE__->config->{static}->{ignore_extensions} = [];
    __PACKAGE__->config->{static}->{no_logs} = 1;
} else {
    __PACKAGE__->setup();
}

__PACKAGE__->config->{authentication} = {
               user_class           => 'Notewise::M::CDBI::User',
               user_field           => 'email',
               password_field       => 'password',
               #password_hash        => 'md5',
           };

sub default : Private {
    my ( $self, $c, $username, $name, $id ) = @_;
    if($name ne ''|| $id) {
        $c->detach('/kernel/view',[$username,$name,$id]);
    } elsif ($username){
        $c->detach('/user/home',[$username]);
    }
    $c->stash->{user}=Notewise::M::CDBI::User->retrieve($c->req->{user_id});
    $c->stash->{template}='home.tt';
}

sub begin : Private {
    my ( $self, $c ) = @_;
    if($self->config->{'BaseUrl'}){
        $c->req->base( new URI($self->config->{'BaseUrl'} ) );
    }
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

    # check to see if they're already logged in
    if ($c->req->{user_id}){
        return 1;
    }
    
    # try to log them in if we can
    if ($c->req->params->{email}
        && $c->req->params->{password}) {
        $c->session_login($c->req->params->{email}, 
                          $c->req->params->{password} );
    }

    #check again to see if they got logged in
    if ($c->req->{user_id}){
        unless($c->req->path){
            my $user=Notewise::M::CDBI::User->retrieve($c->req->{user_id});
            $c->res->redirect('/'.$user->username);
            return 0;
        }
        return 1;
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
