- diff (+no api call if no diff)
- support
  - --timeout
  - --validate
- transformations:
  - task group by name
  - subscription by name
  - approver by name
  - git repo by name
- handle -f option on get
- handle remote file for -f
- clear error message when definition file can't be parsed if file has no extension (stdin)
- tags creation does not seem to work. If they would work the selector for "get" could be implemented
- context / config commands
- create command to create a build/release/pull request approval/... ?
- describe command
- edit command
- logs command
- in variable groups and agent pools for release pipelines it should be possible to also define them with 'id:' or 'name:' to handle the case where the name is a number

- register stuff via annotations?
- remove some duplication in azure devops reporters, transformers, etc

- check if yarn workspaces can be alternative for lerna

- allow id in definition in case rename/move is needed
