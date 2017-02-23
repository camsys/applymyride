#!/usr/bin/env bash
aws s3 sync ./dist/ s3://findmyride-prod/ --acl public-read
