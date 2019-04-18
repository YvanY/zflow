const Listr = require('listr')
const inquirer = require('inquirer')
const git = require('../lib/git')
const vcs = require('../lib/vcs')
const { checkout } = require('../lib/tasks')

module.exports = {
  command: 'release <type>',
  desc: 'deploy to the prod environment',
  builder(yargs) {
    yargs.positional('type', {
      choices: ['next', 'hotfix']
    })
  },
  async handler({ type }) {
    if (type === 'next') {
      ({ releaseConfirm: type} = await inquirer.prompt([{
        type: 'list',
        name: 'releaseConfirm',
        message: 'Do you really want to release next?',
        choices: [{
          name: 'yes, release next.',
          value: 'next'
        }, {
          name: 'no, release hotfix.',
          value: 'hotfix'
        }],
        default: 0
      }]))
    }

    const branch = type === 'hotfix' ? 'latest' : 'next'
    const version = type === 'hotfix' ? 'patch' : 'minor'
    const tasks = [{
      title: `zflow checkout ${branch}`,
      task: () => new Listr(checkout(branch))
    }, {
      title: 'git pull',
      task: () => git.pull()
    }, {
      title: `npm version ${version}`,
      task: () => vcs.publish(version)
    }, {
      title: 'git push',
      task: () => git.push()
    }, {
      title: 'git push --tags',
      task: () => git.pushTags()
    }]

    if (type === 'next') {
      tasks.push({
        title: 'git checkout master',
        task: () => git.checkout('master')
      }, {
        title: 'git pull',
        task: () => git.pull()
      }, {
        title: 'git merge next -m "Merge next into master"',
        task: () => git.merge('next', 'Merge next into master')
      }, {
        title: 'git push',
        task: () => git.push()
      }, {
        title: 'get latest branch',
        task: async ctx => (ctx.branch = (await vcs.getCurrentVersion()).toBranch())
      }, {
        title: `git checkout -b latest`,
        task: ({ branch }, task) => {
          task.title = `git checkout -b ${branch}`

          return git.checkoutNewBranch(branch)
        }
      }, {
        title: `git push -u origin latest`,
        task: ({ branch }, task) => {
          task.title = `git push -u origin ${branch}`

          return git.pushSetUpstream(branch)
        }
      })
    }

    return new Listr(tasks)
      .run()
      .catch(({ message }) => console.error(message))
  }
}
