* diff (+no api call if no diff)
* support
  * --timeout
  * --validate
* transformations:
  * task group by name
  * subscription by name
  * approver by name
  * git repo by name
* tags creation does not seem to work. If they would work the selector for "get" could be implemented
* context / config commands
* create command to create a build/release/pull request approval/... ?
* describe command
* edit command
* logs command
* in variable groups and agent pools for release pipelines it should be possible to also define them with 'id:' or 'name:' to handle the case where the name is a number
* commit hooks via husky, semantic versioning, prettier, tralala

* check if pipectl-azure-devops can be removed from package.json of pipectl, different options would be:
  * install the plugin globally and the ctl globally with npm in -g
  * with npx for a local package.json containing the plugin and the ctl in the dependencies
  * with one-off npx if the plugin is installed globally?

* register stuff via annotations?
* remove some duplication in azure devops reporters, transformers, etc
* yargs sometimes outputting usage for no reason

* json input files, directory/recursive
* handle empty object/array in applyExport instead of having this test in all export functions
