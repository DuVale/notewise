package PopWeb::C::MaskedRelationship;

use strict;
use base 'Catalyst::Base';

=head1 NAME

PopWeb::C::MaskedRelationship - Scaffolding Controller Component

=head1 SYNOPSIS

See L<PopWeb>

=head1 DESCRIPTION

Scaffolding Controller Component.

=head1 METHODS

=over 4

=item add

Sets a template.

=cut

sub add : Local {
    my ( $self, $c ) = @_;
    $c->stash->{template} = 'MaskedRelationship/add.tt';
}

=item default

Forwards to list.

=cut

sub default : Private {
    my ( $self, $c ) = @_;
    $c->forward('list');
}

=item destroy

Destroys a row and forwards to list.

=cut

sub destroy : Local {
    my ( $self, $c, $id ) = @_;
    PopWeb::M::CDBI::MaskedRelationship->retrieve($id)->delete;
    $c->forward('list');
}

=item do_add

Adds a new row to the table and forwards to list.

=cut

sub do_add : Local {
    my ( $self, $c ) = @_;
    $c->form( optional => [ PopWeb::M::CDBI::MaskedRelationship->columns ] );
    if ($c->form->has_missing) {
        $c->stash->{message}='You have to fill in all fields. '.
        'The following are missing: <b>'.
        join(', ',$c->form->missing()).'</b>';
    } elsif ($c->form->has_invalid) {
        $c->stash->{message}='Some fields are correctly filled in. '.
        'The following are invalid: <b>'.
	join(', ',$c->form->invalid()).'</b>';
    } else {
	PopWeb::M::CDBI::MaskedRelationship->create_from_form( $c->form );
    	return $c->forward('list');
    }
    $c->forward('add');
}

=item do_edit

Edits a row and forwards to edit.

=cut

sub do_edit : Local {
    my ( $self, $c, $id ) = @_;
    $c->form( optional => [ PopWeb::M::CDBI::MaskedRelationship->columns ] );
    if ($c->form->has_missing) {
        $c->stash->{message}='You have to fill in all fields.'.
        'the following are missing: <b>'.
        join(', ',$c->form->missing()).'</b>';
    } elsif ($c->form->has_invalid) {
        $c->stash->{message}='Some fields are correctly filled in.'.
        'the following are invalid: <b>'.
	join(', ',$c->form->invalid()).'</b>';
    } else {
	PopWeb::M::CDBI::MaskedRelationship->retrieve($id)->update_from_form( $c->form );
	$c->stash->{message}='Updated OK';
    }
    $c->forward('edit');
}

=item edit

Sets a template.

=cut

sub edit : Local {
    my ( $self, $c, $id ) = @_;
    $c->stash->{item} = PopWeb::M::CDBI::MaskedRelationship->retrieve($id);
    $c->stash->{template} = 'MaskedRelationship/edit.tt';
}

=item list

Sets a template.

=cut

sub list : Local {
    my ( $self, $c ) = @_;
    $c->stash->{template} = 'MaskedRelationship/list.tt';
}

=item view

Fetches a row and sets a template.

=cut

sub view : Local {
    my ( $self, $c, $id ) = @_;
    $c->stash->{item} = PopWeb::M::CDBI::MaskedRelationship->retrieve($id);
    $c->stash->{template} = 'MaskedRelationship/view.tt';
}

=back

=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
