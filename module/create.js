const Listr = require('listr')
const git = require('../lib/git')

module.exports = {
  command: 'create <type> <name>',
  desc: 'create a branch for a new feature or hotfix',
  builder(yargs) {
    yargs.positional('type', {
      choices: ['feature', 'hotfix']
    })
  },
  async handler({ type, name }) {
    const branch = `${type}/${name}`
    const tasks = [{
      title: `check branch name`,
      task: () => git.exec(['check-ref-format', '--branch', branch])
    }, {
      title: `git checkout master`,
      task: () => git.checkout('master')
    }, {
      title: `git pull`,
      task: () => git.pull()
    }, {
      title: `git checkout -b ${branch}`,
      task: () => git.checkoutNewBranch(branch)
    }, {
      title: `git push -u origin ${branch}`,
      task: () => git.pushSetUpstream(branch)
    }]

    return new Listr(tasks)
      .run()
      .catch(({ message }) => console.error(message))
  }
}
