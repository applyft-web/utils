module.exports = {
  branches: [
    { name: 'dev', channel: 'dev', prerelease: 'dev', tagFormat: false },
    { name: 'stage', channel: 'stage', prerelease: 'stage', tagFormat: false }
  ],
  repositoryUrl: 'https://github.com/applyft-web/utils.git',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/npm'
  ]
}
