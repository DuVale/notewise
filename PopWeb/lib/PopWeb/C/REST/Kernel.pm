package PopWeb::C::REST::Kernel;

use strict;
use base 'Catalyst::Base';

=head1 NAME

PopWeb::C::REST::Kernel - Catalyst component

=head1 SYNOPSIS

See L<PopWeb>

=head1 DESCRIPTION

Catalyst component.

=head1 METHODS

=over 4

=item default

=cut

sub xml : Local {
    my ( $self, $c, $id ) = @_;
    my $kernel = PopWeb::M::CDBI::Kernel->retrieve($id);
    $c->res->content_type('text/xml');
    $c->res->output($kernel->to_xml);
}

sub xml_hash : Private {
    my ( $self, $c, $id ) = @_;
    my $kernel = PopWeb::M::CDBI::Kernel->retrieve($id);
    use Data::Dumper;
    $c->res->output("<pre>".Dumper($kernel->to_xml_hash_deep)."</pre>");
}

sub add : Local {
    my ( $self, $c ) = @_;
    $c->form( optional => [ PopWeb::M::CDBI::Kernel->columns ] );
    if ($c->form->has_missing) {
        $c->res->output->("ERROR");
    } elsif ($c->form->has_invalid) {
        $c->res->output->("ERROR");
    } else {
        my %create_hash;
        foreach my $column (PopWeb::M::CDBI::Kernel->columns){
            $create_hash{$column} = $c->form->valid($column);
        }
        $create_hash{user}=$c->req->{user_id};
        my $kernel = PopWeb::M::CDBI::Kernel->create( \%create_hash );
    	return $c->forward('xml',[$kernel->id]);
    }
}

sub update : Local {
    my ( $self, $c, $id ) = @_;
    if (!defined $id){
        $id = $c->req->params->{id};
    }
    $c->form( optional => [ PopWeb::M::CDBI::Kernel->columns ] );
    if ($c->form->has_missing) {
	$c->res->output('ERROR');
    } elsif ($c->form->has_invalid) {
	$c->res->output('ERROR');
    } else {
	my $kernel = PopWeb::M::CDBI::Kernel->retrieve($id);
        # TODO figure out how to unit test these permissons
        if ($kernel->user->id != $c->{user_id}){
            $c->res->output('FORBIDDEN');
        }

        $kernel->update_from_form( $c->form );
	$c->res->output('OK');
    }
}

=back


=head1 AUTHOR

Scotty Allen

=head1 LICENSE

Copyright Scotty Allen.  All rights reserved.

=cut

1;
