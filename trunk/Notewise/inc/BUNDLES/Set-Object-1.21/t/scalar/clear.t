use Set::Object;
print "1..1\n";

my $s = Set::Object->new(0..99);

$s->clear;

print "not " unless $s->is_null;
print "ok 1\n";

