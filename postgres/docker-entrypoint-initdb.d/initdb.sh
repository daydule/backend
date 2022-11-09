CMD_PSQL="psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -p "${POSTGRES_PORT}" -f "

# connect_pg_simple_sql=/home/daydule/connect-pg-simple/table.sql
# echo runnning $connect_pg_simple_sql
# $CMD_PSQL $connect_pg_simple_sql

for dir in /home/daydule/src/*; do
  for sql in $dir/*.sql; do
    if [ -e $sql ]; then
      echo runnning $sql
      $CMD_PSQL $sql
    fi
  done
done
