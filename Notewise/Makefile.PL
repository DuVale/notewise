use inc::Module::Install;

requires( perl => 5.005 );

name('Notewise');
abstract('Catalyst Application');
author('Scotty Allen');
version_from('lib/Notewise.pm');
license('perl');

# we can't bundle DBD::mysql - it's incompatible with bundling because it's makefile
# calls exit.
requires('DBD::mysql' => 0);
requires_external_cc;
requires_external_bin 'make';
system("cd DBD-mysql; perl Makefile.PL PREFIX=../blib; make; make install");

# Binary modules
bundle('Bit::Vector' => 0);
bundle('Cache::FastMmap' => 0);
bundle('Compress::Raw::Zlib' => 0);
bundle('DBD::SQLite' => 0);
bundle('DBI' => 0);
bundle('Date::Calc' => 0);
bundle('DateTime' => 0);
bundle('HTML::Parser' => 0);
bundle('Params::Validate' => 0);
bundle('PAR' => 0);
bundle('Set::Object' => 0);
bundle('XML::Parser' => 0);
bundle('version' => 0);

# All non-binary modules are built into PARs already
requires('PAR');

## Required modules
#requires('Catalyst');
#requires('Catalyst::Model::DBIC::Schema');
#requires('Catalyst::Plugin::Authentication::Store::DBIC');
#requires('Catalyst::Plugin::FormValidator');
#requires('Catalyst::Plugin::Session::State::Cookie');
#requires('Catalyst::Plugin::Session::Store::FastMmap');
#requires('Catalyst::Plugin::Static::Simple');
#requires('Catalyst::View::REST::XML');
#requires('Catalyst::View::TT');
#requires('Catalyst::Model::CDBI');
#requires('Class::DBI');
#requires('DBIx::Class');
#requires('Data::Dumper');
#requires('DateTime');
#requires('DateTime::Format::DateParse');
#requires('DateTime::Format::MySQL');
#requires('Module::Install');
#requires('Template');
#requires('Test::More');
#requires('Test::WWW::Mechanize');
#requires('Test::WWW::Mechanize::Catalyst');
#requires('Test::XML');
#requires('URI');
#requires('XML::Simple');
#requires('YAML');

#catalyst_files();

#auto_install();
install_script( glob('script/*.pl') );
&WriteAll;

