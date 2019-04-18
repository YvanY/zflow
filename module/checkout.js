const Listr = require('listr')
const { checkout } = require('../lib/tasks')

module.exports = {
  command: 'checkout <branch>',
  desc: 'checkout branch',
  async handler({ branch }) {
    const tasks = checkout(branch)

    return new Listr(tasks)
      .run()
      .catch(({ message }) => console.error(message))
  }
}
