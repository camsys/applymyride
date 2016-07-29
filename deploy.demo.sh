#!/usr/bin/env bash
aws s3 sync ./dist/ s3://findmyridepa2-demo.camsys-apps.com/ --acl public-read
