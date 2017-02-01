#!/usr/bin/env bash
aws s3 sync ./dist/ s3://findmyridepa2-demo.camsys-apps.com/ --acl public-read

aws configure set preview.cloudfront true
aws cloudfront create-invalidation \
    --distribution-id E22ZGH1TFQUOOP \
    --paths '/*'

