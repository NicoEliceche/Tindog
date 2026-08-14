$ErrorActionPreference = 'Stop'
$source = $env:DRILL_SOURCE_DATABASE_URL
$target = $env:DRILL_TARGET_DATABASE_URL
if (-not $source -or -not $target) { throw 'Set DRILL_SOURCE_DATABASE_URL and DRILL_TARGET_DATABASE_URL.' }
$targetUri = [Uri]$target
$targetDatabase = $targetUri.AbsolutePath.Trim('/')
if ($targetDatabase -notmatch 'restore[_-]drill') { throw 'Safety stop: target database name must contain restore_drill or restore-drill.' }
$drillDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ('tindog-restore-drill-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $drillDirectory | Out-Null
$dumpPath = Join-Path $drillDirectory 'tindog.dump'
try {
  & pg_dump --format=custom --no-owner --no-acl --file=$dumpPath $source
  if ($LASTEXITCODE -ne 0) { throw 'pg_dump failed.' }
  & pg_restore --clean --if-exists --no-owner --no-acl --dbname=$target $dumpPath
  if ($LASTEXITCODE -ne 0) { throw 'pg_restore failed.' }
  $tableCount = (& psql $target -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';").Trim()
  if ([int]$tableCount -lt 10) { throw "Restore validation failed: only $tableCount public tables found." }
  Write-Host "Restore drill passed with $tableCount public tables. Temporary dump: $dumpPath"
} finally {
  if (Test-Path -LiteralPath $drillDirectory) { Remove-Item -LiteralPath $drillDirectory -Recurse -Force }
}
