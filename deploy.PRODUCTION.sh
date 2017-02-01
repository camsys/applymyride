#!/usr/bin/env bash
aws s3 sync ./dist/ s3://oneclick-pa.camsys-apps.com/ --acl public-read

# aws configure set preview.cloudfront true
# aws cloudfront create-invalidation \
#     --distribution-id ############ \
#     --paths '/*'
