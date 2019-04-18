const vcs = require('../lib/vcs')
const git = require('../lib/git')

function checkout(branch) {
  const tasks = []

  if (branch === 'latest') {
    tasks.push({
      title: 'get latest branch',
      task: async ctx => (ctx.branch = (await vcs.getLatestVersion()).toBranch())
    }, {
      title: 'git checkout latest',
      task: async ({ branch }, task) => {
        task.title = `git checkout ${branch}`

        return git.checkout(branch)
      }
    })
  } else {
    tasks.push({
      title: `git checkout ${branch}`,
      task: () => git.checkout(branch)
    })
  }

  return tasks
}

module.exports = {
  checkout
}
