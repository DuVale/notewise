package PopWeb::C::REST::VKernel;

use strict;
use base 'Catalyst::Base';

=head1 NAME

PopWeb::C::REST::ContainedObject - Catalyst controller for REST interface for visible kernels

=head1 SYNOPSIS

See L<PopWeb>

=head1 DESCRIPTION

Catalyst component.

=head1 METHODS

=over 4

=item xml

Retrieve an xml version of this vkernel (includes the xml for the contained kernel as well).

=cut

sub xml : Local {
    my ( $self, $c, $container_id, $contained_id) = @_;
    my $contained_object = PopWeb::M::CDBI::ContainedObject->retrieve(container_object=>$container_id, contained_object=>$contained_id);
    $c->res->content_type('text/xml');
    $c->res->output($contained_object->to_xml('visiblekernel'));
}

sub xml_hash : Private {
    my ( $self, $c, $id ) = @_;
    my $kernel = PopWeb::M::CDBI::Kernel->retrieve($id);
    use Data::Dumper;
    $c->res->output("<pre>".Dumper($kernel->to_xml_hash_deep)."</pre>");
}

=item add

    Creates a new containedobject/visiblekernel.  Will create a new kernel as well, if a contained_object is not specified. Otherwise it will use the object of that id.  Takes any column of contained_object or kernel as parameters. Must include at least a container_object id

=cut
sub add : Local {
    my ( $self, $c ) = @_;
    $c->form( optional => [ PopWeb::M::CDBI::ContainedObject->columns] );

    if ($c->form->has_missing) {
        $c->res->output->("ERROR");
    } elsif ($c->form->has_invalid) {
        $c->res->output->("ERROR");
    } else {
        $c->form( optional => [ PopWeb::M::CDBI::ContainedObject->columns, PopWeb::M::CDBI::Kernel->columns ] );
        unless($c->req->params->{contained_object}){
            my $kernel = PopWeb::M::CDBI::Kernel->create_from_form( $c->form );
            $c->req->params->{contained_object}=$kernel->id;
        }

        # cause $c->form to be generated again
        $c->form( optional => [ PopWeb::M::CDBI::ContainedObject->columns, PopWeb::M::CDBI::Kernel->columns ] );

	my $contained_object = PopWeb::M::CDBI::ContainedObject->create_from_form( $c->form );
    	return $c->forward('xml',[$contained_object->id]);
    }
}

=item add

Updates this visible kernel.  Takes url arguments container_object id and contained_object id and cgi params x,y,width,height,collapsed

=cut
sub update : Local {
    my ( $self, $c, $container_object, $contained_object) = @_;
    $c->form( optional => [ PopWeb::M::CDBI::ContainedObject->columns ],
              field_filter_regexp_map => { 
                  qr/^(x|y)$/ => [sub {my $val = shift; $val =~ s/px//g; return $val;}],
              },
            );
    unless ($container_object){
        $container_object=$c->req->params->{container_object};
    }
    unless ($contained_object){
        $contained_object=$c->req->params->{contained_object};
    }
    if ($c->form->has_missing) {
	$c->res->output('ERROR');
    } elsif ($c->form->has_invalid) {
	$c->res->output('ERROR');
    } else {
        my $contained_object = PopWeb::M::CDBI::ContainedObject->retrieve(container_object=>$container_object,contained_object=>$contained_object);
        use Data::Dumper;
        $contained_object->update_from_form( $c->form );
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
