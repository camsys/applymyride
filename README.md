Applymyride
================

The app doesn't use ruby directly, but the build process requires the haml rubygem be installed as haml is used to create the html views. (This should work with ruby version > 2.1 and < 3.0, but see below* if < 2.5)

You may need to install node.js first (e.g. `brew install node` on Mac, the latest version should run correctly now).

+ `sudo gem install haml -v '~> 4.0'` (haml 5 will not work)

+ `sudo gem install compass`

+ `npm install`

+ `sudo npm install -g grunt`

+ `sudo npm install -g bower`

+ `bower install`

+ `grunt serve` (to test if it's working)

\* If your ruby version is < 2.5, you'll need to first install libssl 1.0: `brew install rbenv/tap/openssl@1.0`, then you'll need to install your version of ruby with the correct command depending on whether you use rbenv or rvm:
+ ``rvm install 2.3.8 -C --with-openssl-dir=`brew --prefix openssl@1.0\` ``
+ RUBY_CONFIGURE_OPTS="--with-openssl-dir=$(brew --prefix openssl@1.0)" rbenv install 2.3.8

Deploy
================

+ install aws cli tools (http://docs.aws.amazon.com/cli/latest/userguide/installing.html)

+ retreive your AWS user account security keys (you may need to generate them if they don't already exist)

+ run  `aws configure`  to setup your AWS user security credentials (http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-set-up.html).

+ build the application with the command: `grunt --force`

+ execute one of the environment specific deployment scripts (eg. `./deploy.dev.sh`)
