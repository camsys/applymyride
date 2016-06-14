#!/usr/bin/env bash
aws s3 sync ./dist/ s3://findmyridepa2-dev.camsys-apps.com/ --acl public-read
# sed -i '' 's/\<head\>/\<head\> <base href="\/findmyride-sandbox\/" target="_blank" \/> /g' dist/index.html
# s3cmd del s3://findmyride-sandbox/*
# s3cmd put dist/* s3://findmyride-sandbox -r -P
