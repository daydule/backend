CMD_PSQL="psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -p "${POSTGRES_PORT}" -f "

for dir in /home/daydule/src/*; do
  for sql in $dir/*.sql; do
    if [ -e $sql ]; then
      echo runnning $sql
      $CMD_PSQL $sql
    fi
  done
done
