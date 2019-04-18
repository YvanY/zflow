const Listr = require('listr')
const git = require('../lib/git')
const vcs = require('../lib/vcs')
const { checkout } = require('../lib/tasks')

module.exports = {
  command: 'prerelease <type>',
  desc: 'deploy to the stage environment',
  builder(yargs) {
    yargs.positional('type', {
      choices: ['next', 'hotfix']
    })
  },
  async handler({ type }) {
    const branch = type === 'hotfix' ? 'latest' : 'next'
    const tasks = [{
      title: `zflow checkout ${branch}`,
      task: () => new Listr(checkout(branch))
    }, {
      title: 'git pull',
      task: () => git.pull()
    }, {
      title: 'get version',
      task: async ctx => (ctx.version = await vcs.getCurrentVersion())
    }, {
      title: `npm version`,
      task: ({ version }, task) => {
        const newVersion = version.preid
          ? 'prerelease'
          : type === 'hotfix'
            ? 'prepatch'
            : 'preminor'

        task.title = `npm version ${newVersion}`

        return vcs.publish(newVersion)
      }
    }, {
      title: 'git push',
      task: () => git.push()
    }, {
      title: 'git push --tags',
      task: () => git.pushTags()
    }]

    return new Listr(tasks)
      .run()
      .catch(({ message }) => console.error(message))
  }
}
