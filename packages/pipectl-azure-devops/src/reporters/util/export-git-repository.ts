import { GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { filterProp } from './export'

const exportGitRepository: GitRepository | object = {
  _links: filterProp,
  id: filterProp,
  url: filterProp,
  state: filterProp,
  remoteUrl: filterProp,
  sshUrl: filterProp,
  webUrl: filterProp,
  size: filterProp,
  project: filterProp,
  defaultBranch: 'refs/heads/master',
}

export { exportGitRepository }
