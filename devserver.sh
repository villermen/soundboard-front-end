#!/usr/bin/env sh

php -S 0.0.0.0:32658 public/api/index.php & \
npm run dev-server