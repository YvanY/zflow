const Listr = require('listr')
const git = require('../lib/git')
const { checkout } = require('../lib/tasks')

module.exports = {
  command: 'finish [type] [names..]',
  desc: 'merge features or hotfixs to appropriate branch',
  builder(yargs) {
    yargs
      .positional('type', {
        choices: ['feature', 'hotfix', 'current']
      })
      .option('temp', {
        desc: 'Do not apply hotfix to the next version',
        type: 'boolean'
      })
  },
  async handler({ type, names, temp }) {
    if (type === 'current') {
      const current = await git.getCurrentBranch()
      const match = current.match(/^(feature|hotfix)\/(.*)/)

      if (match) {
        type = match[1]
        names = [match[2]]
      } else {
        console.error(`can not finish ${current}`)
        process.exit(1)
      }
    }

    const target = type === 'hotfix' ? 'latest' : 'next'
    const branches = names
      .map(name => `${type}/${name}`)
      .join(' ')
      .toString()
    const tasks = [{
      title: 'git push',
      task: () => git.push()
    }, {
      title: `zflow checkout ${target}`,
      task: () => new Listr(checkout(target))
    }, {
      title: 'git pull',
      task: () => git.pull()
    }, {
      title: `git merge ${branches} -m "Merge ${branches} into ${target}"`,
      task: () => git.merge(branches, `Merge ${branches} into ${target}`)
    }, {
      title: 'git push',
      task: () => git.push()
    }]

    if (type === 'hotfix' && !temp) {
      tasks.push({
        title: `git checkout master`,
        task: () => git.checkout('master')
      }, {
        title: 'git pull',
        task: () => git.pull()
      }, {
        title: `git merge ${branches} -m "Merge ${branches} into master"`,
        task: () => git.merge(branches, `Merge ${branches} into master`)
      }, {
        title: 'git push',
        task: () => git.push()
      }, {
        title: `git checkout next`,
        task: () => git.checkout('next')
      }, {
        title: 'git pull',
        task: () => git.pull()
      }, {
        title: `git merge master -m "Merge master into next"`,
        task: () => git.merge('master', 'Merge master into next')
      }, {
        title: 'git push',
        task: () => git.push()
      })
    }

    return new Listr(tasks)
      .run()
      .catch(({ message }) => console.error(message))
  }
}
