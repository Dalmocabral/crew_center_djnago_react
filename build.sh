#!/usr/bin/env bash
set -o errexit

cd Backend  # entra na pasta onde está o manage.py

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate