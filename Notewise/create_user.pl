#! /usr/bin/perl

use strict;
use warnings;

use lib qw/lib/;
use Notewise;

local $|;
my ($username,$name,$email);

print "\n\n\n";
while (!$username){
    print "Username: ";
    $username = <>;
}
while (!$name){
    print "Full name: ";
    $name = <>;
}
while (!$email){
    print "Email: ";
    $email = <>;
}

chomp $username;
chomp $name;
chomp $email;

my $user = Notewise::M::CDBI::User->insert({username=>$username,
                                            name    =>$name,
                                            email   =>$email,
                                           });

my $kernel = Notewise::M::CDBI::Kernel->insert({name=>'start',
                                                user=>$user});

if ($user && $kernel){
    print "User was successfully created\n";
    exit(0);
} else {
    print "Error creating user!\n";
    exit(1);
}
