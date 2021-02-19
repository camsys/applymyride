#!/usr/bin/env bash
aws s3 sync ./dist/ s3://ui-pa-dev/ --acl public-read

aws configure set preview.cloudfront true
aws cloudfront create-invalidation \
    --distribution-id E1TB3A9G4UWN1L \
    --paths '/*'

