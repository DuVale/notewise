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

sub default : Private {
    my ( $self, $c ) = @_;
    $c->res->output('Congratulations, PopWeb::C::REST::Kernel is on Catalyst!');
}

sub xml : Local {
    my ( $self, $c, $id ) = @_;
    my $kernel = PopWeb::M::CDBI::Kernel->retrieve($id);
    $c->res->content_type('text/xml');
    $c->res->output($kernel->to_xml);
}

sub xml_hash : Local {
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
	my $kernel = PopWeb::M::CDBI::Kernel->create_from_form( $c->form );
    	return $c->forward('xml',[$kernel->id]);
    }
    $c->forward('add');
}

=back


=head1 AUTHOR

Scotty Allen

=head1 LICENSE

This library is free software . You can redistribute it and/or modify
it under the same terms as perl itself.

=cut

1;
