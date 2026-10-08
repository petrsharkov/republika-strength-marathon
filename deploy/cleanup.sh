#!/usr/bin/env bash
set -euo pipefail
mkdir -p "$HOME/republika-deploy"
# The deploy script already owns the lock when calling with --locked.
if [[ ${1:-} != --locked ]]; then
  exec 9>"$HOME/republika-deploy/deploy.lock"
  flock -w 300 9
fi

# Preserve every image referenced by any container, including our rollback.
declare -A used=()
container_ids=$(docker ps -aq)
if [[ -n "$container_ids" ]]; then
  mapfile -t containers <<< "$container_ids"
  used_ids=$(docker inspect -f '{{.Image}}' "${containers[@]}")
  while read -r id; do used["$id"]=1; done <<< "$used_ids"
fi
while read -r ref id; do
  [[ -n "$ref" && "$ref" == republika-marathon:* ]] || continue
  [[ -n ${used[$id]:-} ]] && continue
  # No force: Docker also protects images acquired by concurrent containers.
  docker image rm "$ref" || echo "Could not remove $ref; will retry next deployment." >&2
done < <(docker image ls --no-trunc --filter 'reference=republika-marathon:*' --format '{{.Repository}}:{{.Tag}} {{.ID}}')

# Remove only old transfer files made by the original marathon workflow.
shopt -s nullglob
for directory in "$HOME"/republika-deploy/incoming-*; do
  [[ -d "$directory" && ! -L "$directory" ]] || continue
  [[ ${directory##*/} =~ ^incoming-[0-9]+-[0-9]+$ ]] || continue
  rm -f -- "$directory/marathon-image.tar.gz" "$directory/deploy.sh"
  rmdir -- "$directory" 2>/dev/null || true
done

# Keep the five most recent database backups. The live database is untouched.
if [[ $(docker inspect -f '{{.State.Running}}' republika-marathon 2>/dev/null || true) == true ]]; then
  docker exec republika-marathon node --input-type=module -e '
    import {readdirSync, unlinkSync, existsSync} from "node:fs";
    const directory = "/data/backups";
    if (existsSync(directory)) {
      const backups = readdirSync(directory).filter(name => /^before-[0-9]+\.sqlite$/.test(name))
        .sort((a,b) => Number(b.slice(7,-7))-Number(a.slice(7,-7)));
      for (const name of backups.slice(5)) unlinkSync(`${directory}/${name}`);
    }'
fi
