#!/usr/bin/env bash
aws s3 sync ./dist/ s3://ui-pa-qa2/ --acl public-read

aws configure set preview.cloudfront true
aws cloudfront create-invalidation \
    --distribution-id E1DU41EFM6E61O \
    --paths '/*'

