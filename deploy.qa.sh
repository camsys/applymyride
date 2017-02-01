#!/usr/bin/env bash
aws s3 sync ./dist/ s3://findmyridepa2-qa.camsys-apps.com/ --acl public-read

aws configure set preview.cloudfront true
aws cloudfront create-invalidation \
    --distribution-id E1J1L7T3MUWTG4 \
    --paths '/*'

