const execa = require('execa')
const readPkgUp = require('read-pkg-up')
const git = require('./git')

const execNpm = (args = [], opts = {}) => execa('npm', args, opts)

class Vcs {
  publish(version, args = []) {
    return execNpm(['version', version, ...args])
  }

  async getCurrentVersion() {
    const { pkg: { version } } = await readPkgUp()
    const [rest, preid] = version.split('-')
    const [major, minor, patch] = rest.split('.')
    const toBranch = function () { return `v${this.major}.${this.minor}` }

    return { major, minor, patch, preid, toBranch }
  }

  async getLatestVersion() {
    let version

    await git.checkout('master')
    await git.pull()
    version = await this.getCurrentVersion()
    await git.checkout('@{-1}')
    await git.pull()

    return version
  }
}

module.exports = new Vcs()
