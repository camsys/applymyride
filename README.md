Applymyride
================

although the app doesn't use ruby, build process requires haml rubygem installed.

You may need to install node.js first.

+ sudo gem install haml

+ sudo gem install compass

+ npm install

+ sudo npm install -g grunt

+ sudo npm install -g bower

+ bower install

+ grunt serve (to test if it's working)


Deploy
================

+ install aws cli tools (http://docs.aws.amazon.com/cli/latest/userguide/installing.html)

+ retreive your AWS user account security keys (you may need to generate them if they don't already exist)

+ run  `aws configure`  to setup your AWS user security credentials (http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-set-up.html).

+ build the application with the command: `grunt --force`

+ execute one of the environment specific deployment scripts (eg. `./deploy.dev.sh`)
