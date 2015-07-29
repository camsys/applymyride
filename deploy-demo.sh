#!/usr/bin/env bash
git checkout $
git pull
bower install
datetag=$(date "+%Y%m%d%H%M").'_DEMO_deploy'
git tag -a $datetag -m 'Demo deploy'
grunt build
perl -pi.bak -e 's/\<head\>/\<head\> <base href="\/findmyride-demo\/" target="_blank" \/> /g' dist/index.html
perl -pi.bak -e "s/deployed_version/$datetag /g" dist/index.html
rm dist/*.bak
s3cmd del s3://findmyride-demo/*
s3cmd put dist/* s3://findmyride-demo -r -P
git push --tags
