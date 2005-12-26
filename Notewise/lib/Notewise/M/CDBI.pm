package Notewise::M::CDBI;

use strict;
use Catalyst::Model::CDBI;
use base 'Catalyst::Model::CDBI';
use DateTime::Format::MySQL;
use DateTime;
use XML::Simple;

__PACKAGE__->config(
    options       => {},
    relationships => 1,
    additional_base_classes => [qw/Class::DBI::FromForm Class::DBI::AsForm Class::DBI::AbstractSearch/],
);

sub to_xml {
    my $self = shift;
    my $label = shift;
    if ($label){
        return XMLout({$label => $self->to_xml_hash_deep},KeepRoot=>1);
    } else {
        return XMLout($self->to_xml_hash_deep,KeepRoot=>1);
    }
}

sub inflate_datetime { return _inflate_dt('datetime',@_) }
sub inflate_timestamp { return _inflate_dt('timestamp',@_) }

sub _inflate_dt { 
    my $type = shift;
    my $dt;
    if($type eq 'datetime'){
        $dt = DateTime::Format::MySQL->parse_datetime( shift );
    } elsif ($type eq 'timestamp'){
        $dt = DateTime::Format::MySQL->parse_timestamp( shift );
    }
    return $dt;
};

sub deflate_datetime { return _deflate_dt('datetime',@_) }
sub deflate_timestamp { return _deflate_dt('timestamp',@_) }

sub _deflate_dt {
    my $type = shift;
    my $dt = shift;
    if(ref $dt){
        if($type eq 'datetime'){
            return DateTime::Format::MySQL->format_datetime($dt);
        } elsif ($type eq 'timestamp'){
            return DateTime::Format::MySQL->format_datetime($dt);
        }
    } else {
        return $dt;
    }
}

sub strf_format {
    return '%Y-%m-%d %H:%M:%S';
}

sub add_created_date {
    my $self=shift;
    unless($self->created){
        # XXX this returns UTC, not server time
        my $now = DateTime->now();
        $self->_attribute_store(created => $now->ymd('-').' '.$now->hms);
    }
}

=head1 NAME

Notewise::M::CDBI - CDBI Model Component

=head1 SYNOPSIS

    Very simple to use

=head1 DESCRIPTION

Very nice component.

=head1 AUTHOR

Clever guy

=head1 LICENSE

This library is free software . You can redistribute it and/or modify it under
the same terms as perl itself.

=cut

1;

