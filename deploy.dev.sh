#!/usr/bin/env bash
aws s3 sync ./dist/ s3://ui-pa-dev-occ-ec2/ --acl public-read

aws configure set preview.cloudfront true
aws cloudfront create-invalidation \
    --distribution-id E2PQ7QYDXFVJR4 \
    --paths '/*'

