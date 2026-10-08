#!/usr/bin/env bash
set -euo pipefail
commit=${1:?Commit SHA required}
archive=${2:?Image archive required}
[[ "$commit" =~ ^[0-9a-f]{40}$ ]] || exit 2
command -v docker >/dev/null
command -v flock >/dev/null
mkdir -p "$HOME/republika-deploy"
exec 9>"$HOME/republika-deploy/deploy.lock"
flock -w 300 9
image="republika-marathon:$commit"
name=republika-marathon
volume=republika-marathon-data
candidate=republika-marathon-candidate
previous=republika-marathon-previous
docker volume create "$volume" >/dev/null
gzip -dc "$archive" | docker load

wait_healthy() {
  local container=$1 status
  for attempt in {1..40}; do
    status=$(docker inspect -f '{{.State.Health.Status}}' "$container")
    [[ "$status" == healthy ]] && return 0
    [[ "$status" == unhealthy ]] && break
    sleep 3
  done
  docker logs --tail 60 "$container"
  return 1
}

# Online SQLite backup before the new version touches the persistent volume.
if docker inspect "$name" >/dev/null 2>&1; then
  docker exec "$name" node --input-type=module -e '
    import {DatabaseSync, backup} from "node:sqlite";
    import {mkdirSync, existsSync} from "node:fs";
    if (existsSync("/data/marathon.sqlite")) {
      mkdirSync("/data/backups", {recursive:true});
      const db = new DatabaseSync("/data/marathon.sqlite");
      await backup(db, `/data/backups/before-${Date.now()}.sqlite`);
      db.close();
    }'
fi
docker rm -f "$candidate" >/dev/null 2>&1 || true
docker run -d --name "$candidate" --mount "source=$volume,target=/data" "$image" >/dev/null
if ! wait_healthy "$candidate"; then
  docker rm -f "$candidate" >/dev/null
  echo 'New version failed; current container was left running.' >&2
  exit 1
fi
docker rm -f "$candidate" >/dev/null
docker rm -f "$previous" >/dev/null 2>&1 || true
had_previous=false
if docker inspect "$name" >/dev/null 2>&1; then
  docker stop "$name" >/dev/null
  docker rename "$name" "$previous"
  had_previous=true
fi
rollback() {
  docker rm -f "$name" >/dev/null 2>&1 || true
  if [[ "$had_previous" == true ]]; then
    docker rename "$previous" "$name"
    docker start "$name" >/dev/null
  fi
  echo 'Deployment failed; previous application restored. Database backup is in /data/backups.' >&2
}
if ! docker run -d --name "$name" --restart unless-stopped \
  --log-opt max-size=10m --log-opt max-file=3 \
  -p 127.0.0.1:3000:3000 --mount "source=$volume,target=/data" "$image" >/dev/null; then
  rollback; exit 1
fi
if ! wait_healthy "$name"; then rollback; exit 1; fi
echo "Deployed $commit on 127.0.0.1:3000"
