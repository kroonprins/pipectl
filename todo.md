* diff (+no api call if no diff)
* support
  * --timeout
  * --validate
  * --kubeconfig
* transformations:
  * task group by name
  * subscription by name
  * approver by name
* tags creation does not seem to work. If they would work the selector for "get" could be implemented
* context / config commands
* create command to create a build/release/pull request approval/... ?
* describe command
* edit command
* logs command
* dynamic imports to bootstrap azure-devops?
* in variable groups and agent pools for release pipelines it should be possible to also define them with 'id:' or 'name:' to handle the case where the name is a number
* commit hooks via husky, semantic versioning, prettier, tralala

* don't use import statements with src of other package
* check if shared dependencies can be in top level package.json only
