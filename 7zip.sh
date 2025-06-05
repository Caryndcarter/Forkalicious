#!/bin/sh

7z a -r forktastic_DA_postedit.zip . \
  -xr!*.env \
  -xr!.git\* \
  -xr!*node_modules\* \
  -xr!*dist\* \
  -xr!zip.sh \
  -xr!run_my_docker.sh
