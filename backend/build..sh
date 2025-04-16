set -o errexit

pip install -r requirements.txt

python  manager.py collectstatic --no-input

python  manager.py migrate