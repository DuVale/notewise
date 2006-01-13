package Notewise::C::Kernel;

use strict;
use base 'Catalyst::Base';

=head1 NAME

Notewise::C::Kernel - Scaffolding Controller Component

=head1 SYNOPSIS

See L<Notewise>

=head1 DESCRIPTION

Scaffolding Controller Component.

=head1 METHODS

=over 4

=cut

=item add

Adds a kernel

=cut

sub add : Local {
    my ( $self, $c ) = @_;
    $c->form( optional => [ Notewise::M::CDBI::Kernel->columns ] );
    if ($c->form->has_missing) {
        $c->stash->{message}='You have to fill in all fields. '.
        'The following are missing: <b>'.
        join(', ',$c->form->missing()).'</b>';
    } elsif ($c->form->has_invalid) {
        $c->stash->{message}='Some fields are correctly filled in. '.
        'The following are invalid: <b>'.
	join(', ',$c->form->invalid()).'</b>';
    } else {
	my $kernel = Notewise::M::CDBI::Kernel->create_from_form( $c->form );
        $kernel->user($c->req->{user_id});
        $kernel->update;
        return $c->res->redirect($c->req->base."kernel/view/".$kernel->id);
    }
}

=item view

Fetches a row and sets a template.

=cut

sub view : Regex('^([^rk].*)/(.*)/(\d+)') {
    my ( $self, $c ) = @_;
    my $username = $c->req->snippets->[0];
    my $name = $c->req->snippets->[0];
    my $id = $c->req->snippets->[2];
    if ($id){
        $c->stash->{kernel} = Notewise::M::CDBI::Kernel->retrieve($id);
        $c->forward('view_kernel');
    } else {
        die "TODO - write kernel disambiguation page";
    }
}

sub view_kernel : Private {
    my ( $self, $c ) = @_;
    my $kernel = $c->stash->{kernel};
    unless ($kernel->has_permission($c->req->{user_id},'view')){
        $c->res->status(403); # Forbidden
        #TODO make this screen prettier
        return $c->res->output('You do not have access to this kernel');
    }
    $c->stash->{visible_kernels} = [Notewise::M::CDBI::ContainedObject->search({container_object=>$kernel->id})];
    $c->stash->{notes} = [Notewise::M::CDBI::Note->search({container_object=>$kernel->id})];
    $c->stash->{visible_relationships} = [$c->stash->{kernel}->visible_relationships];
    $c->stash->{template} = 'Kernel/view.tt';
}

sub innerhtml : Local {
    my ( $self, $c, $id ) = @_;
    $c->stash->{kernel} = Notewise::M::CDBI::Kernel->retrieve($id);
    $c->stash->{template} = 'Kernel/kernel-innerhtml.tt';
}

=back

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
