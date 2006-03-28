package Notewise::C::User;

use strict;
use base 'Catalyst::Base';
use LWP::UserAgent;
use HTTP::Request::Common;

=head1 NAME

Notewise::C::User - Scaffolding Controller Component

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

Scaffolding Controller Component.

=head1 METHODS

=over 4

=cut

sub login : Local {
    my ( $self, $c ) = @_;
    $c->stash->{template} = 'User/login.tt';
}

sub home : Local {
    my ( $self, $c, $username ) = @_;
    my $user = $c->model('CDBI::User')->search(username=>lc($username))->first;
    unless($user->id == $c->user->user->id){
        # TODO - need to make a different version for the public
        die "Sorry, you don't have permission to look at that user's homepage";
    }
    $c->stash->{user}=$user;
    $c->stash->{lastviewed}=[$c->model('CDBI::Kernel')->most_recently_viewed_kernel($user->id,15)];
    $c->stash->{lastcreated}=[$c->model('CDBI::Kernel')->most_recently_created_kernel($user->id,15)];
    $c->stash->{template} = 'User/home.tt';
}

sub bug_report : Local {
    my ( $self, $c ) = @_;
    $c->stash->{template} = 'User/bug_report.tt';
}

sub do_bug_report : Local {
    my ( $self, $c ) = @_;
    $c->form( required => [ 'summary', 'description' ] );
    if ($c->form->has_missing) {
        $c->stash->{message}="Please fill in both fields";
        return $c->forward('bug_report');
    }

    # submit the bug
    my $ua = LWP::UserAgent->new;
    my $req = (POST 'http://admin.notewise.com/trac/newticket',{
        reporter => $c->user->user->username,
        summary => $c->req->params->{summary},
        description => $c->req->params->{description},
        type => 'defect',
        action => 'create',
        status => 'new',
        priority => 'major',
        component => 'general',
    });

    $req->authorization_basic($c->config->{bug_username},$c->config->{bug_password});
    my $res = $ua->request($req);

    # debuug
    #$c->res->output($res->as_string);

    $c->stash->{template} = 'User/bug_thanks.tt';
}

sub settings : Local {
    my ( $self, $c) = @_;
    $c->stash->{template} = 'User/settings.tt';
}

sub change_password : Local {
    my ( $self, $c) = @_;
    $c->form( required => [ qw(oldpassword newpassword newpasswordagain) ],
              constraint_methods => {
                  newpassword => {
                      constraint => sub { return $_[1] eq $_[2]; },
                      params => [ qw(newpassword newpasswordagain) ]
                  }
              }
            );

    if ($c->form->has_missing) {
        $c->stash->{message}="Please fill in all required fields";
        return $c->forward('settings');
    }
    if ($c->form->has_invalid) {
        $c->stash->{message}="Sorry, the new passwords didn't match";
        return $c->forward('settings');
    }
    if (!$c->user->user->check_password($c->form->valid('oldpassword'))) {
        $c->stash->{message}="Sorry, your old password didn't match";
        return $c->forward('settings');
    }

    $c->user->user->password(Digest::MD5::md5_hex($c->form->valid('newpassword')));
    $c->user->user->update;

    $c->stash->{'message'} = "Your password has successfully been changed.";
    $c->forward('settings');
}

sub calendar : Local {
    my ( $self, $c ) = @_;

    my @kernels = $c->user->user->kernels();
    my %kernels;
    my @dates;
    foreach my $kernel (@kernels){
        my $date = $kernel->created->mdy;
        unless($kernels{$date}){
            $kernels{$date} = [];
            push @dates, $date;
        }
        push @{$kernels{$date}}, $kernel;
    }
    $c->stash->{kernels} = \%kernels;
    $c->stash->{dates} = \@dates;
    $c->stash->{template} = 'User/calendar.tt';
}

1;
