module.exports = {
  branches: [
    { name: 'dev',  channel: 'dev',  prerelease: 'dev'  },
    { name: 'stage', channel: 'stage', prerelease: 'stage' },
    { name: 'main' }
  ],
  repositoryUrl: 'https://github.com/applyft-web/utils.git',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    '@semantic-release/github',
    '@semantic-release/git'
  ]
}
