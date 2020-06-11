# pipectl

Create Azure DevOps / TFS resources declaratively, in kubectl-style.

```
npm install -g @kroonprins/pipectl @kroonprins/pipectl-azure-devops @kroonprins/pipectl-azure-devops-imperative-extensions
pipectl get BuildDefinition
pipectl apply -f sample/resources/GitRepository.yaml -f sample/resources/VariableGroup.yaml -f sample/resources/TaskGroup.yaml -f sample/resources/BuildPipeline.yaml -f sample/resources/ReleasePipeline.yaml --dry-run
```

or

```
npm init -y
npm install @kroonprins/pipectl @kroonprins/pipectl-azure-devops @kroonprins/pipectl-azure-devops-imperative-extensions
npx pipectl get BuildDefinition
npx pipectl apply -f sample/resources/GitRepository.yaml -f sample/resources/VariableGroup.yaml -f sample/resources/TaskGroup.yaml -f sample/resources/BuildPipeline.yaml -f sample/resources/ReleasePipeline.yaml --dry-run
```

Configure server and user details in config file like the example of `sample/config/config.yaml`:

- place it `$HOME/.pipe/config`
- or, set environment variable `PIPECONFIG` to the location of the file
- or, call pipectl with command line option `--pipeconfig=<location config file>`
