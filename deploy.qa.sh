#!/usr/bin/env bash
aws s3 sync ./dist/ s3://ui-pa-qa-occ-ec2/ --acl public-read

aws configure set preview.cloudfront true
aws cloudfront create-invalidation \
    --distribution-id E2GPY1DTB7E2FX \
    --paths '/*'

# E1DU41EFM6E61O # This is the test.findmyride.com distrubution