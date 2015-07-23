#!/usr/bin/env bash
sed -i '' 's/\<head\>/\<head\> <base href="\/findmyride-sandbox\/" target="_blank" \/> /g' dist/index.html
s3cmd del s3://findmyride-sandbox/*
s3cmd put dist/* s3://findmyride-sandbox -r -P
