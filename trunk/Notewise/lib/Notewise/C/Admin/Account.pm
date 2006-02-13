package Notewise::C::Admin::Account;

use strict;
use base 'Catalyst::Base';

=head1 NAME

Notewise::C::Admin::Account - Scaffolding Controller Component

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

Scaffolding Controller Component.

=head1 METHODS

=over 4

=item add

Sets a template.

=cut

sub add : Local {
    my ( $self, $c ) = @_;
    $c->stash->{template} = 'Admin-Account/add.tt';
}

=item default

Forwards to list.

=cut

sub default : Private {
    my ( $self, $c ) = @_;
    $c->forward('list');
}

=item delete

Confirms a delete.

=cut

sub delete : Local {
    my ( $self, $c, $id ) = @_;
    $c->stash->{user} = $c->model('CDBI::User')->retrieve($id);
    $c->stash->{template} = 'Admin-Account/delete.tt';
}

=item do_delete

Deletes a row and forwards to list.

=cut

sub do_delete : Local {
    my ( $self, $c, $id ) = @_;
    $c->model('CDBI::User')->retrieve($id)->delete;
    $c->res->redirect($c->req->base . 'admin/account/');
}

=item clear

Confirms a clear.

=cut

sub clear : Local {
    my ( $self, $c, $id ) = @_;
    $c->stash->{user} = $c->model('CDBI::User')->retrieve($id);
    $c->stash->{template} = 'Admin-Account/clear.tt';
}

=item do_clear

Clears the kernels, notes, and relationships for a user.

=cut

sub do_clear : Local {
    my ( $self, $c, $id ) = @_;
    my $user = $c->model('CDBI::User')->retrieve($id);
    $user->clear;
    my $kernel = $c->model('CDBI::Kernel')->insert({name=>'',
                                                    user=>$user});
    $c->res->redirect($c->req->base . 'admin/account/');
}

=item do_add

Adds a new row to the table and forwards to list.

=cut

sub do_add : Local {
    my ( $self, $c ) = @_;
    $c->form( required => [ qw(email password name username confirm_password) ] );
    if ($c->form->has_missing) {
        $c->stash->{message}='You have to fill in all fields. '.
        'The following are missing: <b>'.
        join(', ',$c->form->missing()).'</b>';
    } elsif ($c->form->has_invalid) {
        $c->stash->{message}='Some fields are correctly filled in. '.
        'The following are invalid: <b>'.
	join(', ',$c->form->invalid()).'</b>';
    } elsif ($c->req->params->{password} ne $c->req->params->{confirm_password}) {
        $c->stash->{message}="Sorry, those passwords don't match";
    } else {
	my $user = Notewise::M::CDBI::User->create_from_form( $c->form );
        my $kernel = $c->model('CDBI::Kernel')->insert({name=>'',
                                                        user=>$user});
        return $c->res->redirect($c->req->base . 'admin/account/list');
    }
    return $c->forward('add');
}

=item do_edit

Edits a row and forwards to edit.

=cut

sub do_edit : Local {
    my ( $self, $c, $id ) = @_;
    $c->form( optional => [ $c->model('CDBI::User')->columns ] );
    if ($c->form->has_missing) {
        $c->stash->{message}='You have to fill in all fields.'.
        'the following are missing: <b>'.
        join(', ',$c->form->missing()).'</b>';
    } elsif ($c->form->has_invalid) {
        $c->stash->{message}='Some fields are correctly filled in.'.
        'the following are invalid: <b>'.
	join(', ',$c->form->invalid()).'</b>';
    } else {
	$c->model('CDBI::User')->retrieve($id)->update_from_form( $c->form );
	$c->stash->{message}='Updated OK';
    }
    $c->forward('edit');
}

=item edit

Sets a template.

=cut

sub edit : Local {
    my ( $self, $c, $id ) = @_;
    $c->stash->{item} = $c->model('CDBI::User')->retrieve($id);
    $c->stash->{template} = 'Admin-Account/edit.tt';
}

=item list

Sets a template.

=cut

sub list : Local {
    my ( $self, $c ) = @_;
    $c->stash->{template} = 'Admin-Account/list.tt';
}

=item view

Fetches a row and sets a template.

=cut

sub view : Local {
    my ( $self, $c, $id ) = @_;
    $c->stash->{item} = $c->model('CDBI::User')->retrieve($id);
    $c->stash->{template} = 'Admin-Account/view.tt';
}

=back

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
