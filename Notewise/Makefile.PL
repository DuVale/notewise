use inc::Module::Install;

name('Notewise');
abstract('Catalyst Application');
author('Scotty Allen');
version_from('lib/Notewise.pm');
license('perl');

include('ExtUtils::AutoInstall');

requires( Catalyst => '5.60' );

catalyst_files();

install_script( glob('script/*.pl') );
auto_install();
&WriteAll;
