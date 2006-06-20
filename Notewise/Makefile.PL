use inc::Module::Install;

name('Notewise');
abstract('Catalyst Application');
author('Scotty Allen');
version_from('lib/Notewise.pm');
license('perl');

include('ExtUtils::AutoInstall');

requires( Catalyst => '5.60' );
requires( 'DBIx::Class' => 0);
requires( 'Catalyst::Model::DBIC::Schema' => 0);
requires( 'YAML' => 0 );
requires( 'DateTime' => 0 );
requires( 'DateTime::Format::DateParse' => 0 );
requires( 'DateTime::Format::MySQL' => 0 );
requires( 'Test::XML' => 0 );
requires( 'Test::WWW::Mechanize' => 0 );
requires( 'Test::WWW::Mechanize::Catalyst' => 0 );
requires( 'Data::Dumper' => 0 );
requires( 'Test::More' => 0 );
requires( 'XML::Simple' => 0 );
requires( 'Catalyst::View::REST::XML' => 0 );
requires( 'Module::Install' => 0 );
requires( 'URI' => 0 );
requires( 'Catalyst::Plugin::Authentication::Store::DBIC' => 0 );
requires( 'Catalyst::Plugin::Session::Store::FastMmap' => 0 );
requires( 'Catalyst::Plugin::Session::State::Cookie' => 0 );
requires( 'Template' => 0 );

catalyst_files();

install_script( glob('script/*.pl') );
auto_install();
&WriteAll;

