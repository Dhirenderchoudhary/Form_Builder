#!/bin/bash

if [ -f ".env" ]; then
  echo ".env file exists. ✅"
else
  echo ".env file does not exist. Copying from .env.example..."
  cp .env.example .env
fi

for dir in apps/* packages/*; do
  if [ -d "$dir" ]; then
    target="$dir/.env"
    # Only link if target does not exist or is not already a symlink to the right location
    if [ ! -L "$target" ] || [ "$(readlink -- "$target")" != "$(realpath .env)" ]; then
      if [ ! -e "$target" ]; then
        ln -s "$(realpath .env)" "$target"
        echo "Linked .env -> $target ✅"
      fi
    else
      echo "Already linked: $target ✅"
    fi
  fi
done
