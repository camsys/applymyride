#!/usr/bin/env bash
aws s3 sync ./dist/ s3://ui-pa-prod/ --acl public-read --cache-control no-cache

aws configure set preview.cloudfront true
aws cloudfront create-invalidation \
    --distribution-id E1YS8Y9USQ8TCX \
    --paths '/*'