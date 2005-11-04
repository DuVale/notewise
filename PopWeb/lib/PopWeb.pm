package PopWeb;

use strict;
use Catalyst qw/-Debug FormValidator Session::FastMmap Authentication::CDBI/;

our $VERSION = '0.01';

PopWeb->config( name => 'PopWeb',
                'PopWeb::V::TT' => {
                    TIMER => 0,
                },
              );

PopWeb->setup( qw/Static::Simple/ );
PopWeb->config->{static}->{ignore_extensions} = [];

__PACKAGE__->config->{authentication} = {
               user_class           => 'PopWeb::M::CDBI::User',
               user_field           => 'email',
               password_field       => 'password',
               #password_hash        => 'md5',
           };

=head1 NAME

PopWeb - Catalyst based application

=head1 SYNOPSIS

    script/popweb_server.pl

=head1 DESCRIPTION

Catalyst based application.

=head1 METHODS

=over 4

=item default

=cut

sub default : Private {
    my ( $self, $c ) = @_;
    $c->stash->{template}='home.tt';
    $c->stash->{kernels}=[PopWeb::M::CDBI::Kernel->retrieve_all];
}

sub end : Private {
    my ( $self, $c ) = @_;
    $c->forward('PopWeb::V::TT') unless $c->res->output;
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
        return 1;
    }

    # otherwise forward to display the login page, and break the auto chain
    $c->forward('/user/login');
    return 0;
}

=back

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
