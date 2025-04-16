set -o errexit

pip install -r requirements.txt

python  manager.py collectstatic --no-imput

python  manager.py migrate