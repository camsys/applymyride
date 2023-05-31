#!/usr/bin/env bash
aws s3 sync ./dist/ s3://ui-pa-sandbox/ --acl public-read

aws configure set preview.cloudfront true
aws cloudfront create-invalidation \
    --distribution-id EKX8GEIJM5XII \
    --paths '/*'