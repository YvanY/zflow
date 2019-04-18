const execa = require('execa')

class Git {
  exec(args = [], opts = {}) {
    return execa('git', args, opts)
  }

  pull(args = []) {
    return this.exec(['pull', ...args])
  }

  push(args = []) {
    return this.exec(['push', ...args])
  }

  pushSetUpstream(branch, args = []) {
    return this.exec(['push', '-u', ...args, 'origin', branch])
  }

  pushTags(args = []) {
    return this.exec(['push', '--tags', ...args])
  }

  checkout(branch, args = []) {
    return this.exec(['checkout', ...args, branch])
  }

  checkoutNewBranch(branch, args = []) {
    return this.exec(['checkout', '-b', ...args, branch])
  }

  merge(branches, message, args = []) {
    branches = Array.isArray(branches) ? branches : [branches]

    return this.exec(['merge', '-m', message, ...args, ...branches])
  }

  async getCurrentBranch() {
    const { stdout } = await this.exec(['symbolic-ref', '--short', 'HEAD'])

    return stdout.trim()
  }

  status(args = []) {
    return this.exec(['status', ...args])
  }

  async checkWorkingTreeClean() {
    const { stdout } = await this.status(['--porcelain'])
    const lines = this._cleanStatusLines(stdout)

    if (lines.length) throw new Error('git working directory not clean.\n')
  }

  _cleanStatusLines(stdout) {
    return stdout
        .trim()
        .split('\n')
        .filter(line => line.trim() && !line.match(/^\?\? /))
        .map(line => line.trim())
  }
}

module.exports = new Git()
