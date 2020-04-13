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

- check if pipectl-azure-devops can be removed from package.json of pipectl, different options would be:

  - install the plugin globally and the ctl globally with npm in -g
  - with npx for a local package.json containing the plugin and the ctl in the dependencies
  - with one-off npx if the plugin is installed globally?

- register stuff via annotations?
- remove some duplication in azure devops reporters, transformers, etc

- handle empty object/array in applyExport instead of having this test in all export functions

- check if yarn workspaces can be alternative for lerna
- use renovate/dependabot instead of updates
