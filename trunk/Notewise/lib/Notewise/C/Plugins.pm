package Notewise::C::Plugins;

use strict;
use base 'Catalyst::Base';

sub firefox : Path('/plugins/notewise.src') {
    my ( $self, $c ) = @_;
    $c->stash->{username} = $c->user->user->username;
    $c->stash->{authenhash} = $c->user->user->authenhash;
    $c->stash->{template} = 'plugins/firefox-search.tt';
}

1;
