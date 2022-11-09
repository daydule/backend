# TODO: DBの起動を確認してからバックエンドサーバー起動
# set -e
# until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U $POSTGRES_USER -c '\q'; do
#   >&2 echo "Postgres is unavailable - sleeping"
#   sleep 1
# done
# >&2 echo "Postgres is up - executing command"

sleep 4

node_start="$@"
exec $node_start
