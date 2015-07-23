#!/usr/bin/env bash
sed -i '' 's/\<head\>/\<head\> <base href="\/findmyride-demo\/" target="_blank" \/> /g' dist/index.html
s3cmd del s3://findmyride-demo/*
s3cmd put dist/* s3://findmyride-demo -r -P
