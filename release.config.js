module.exports = {
  branches: [
    { name: 'dev',  channel: 'dev',  prerelease: 'dev', tagFormat: false  },
    { name: 'stage', channel: 'stage', prerelease: 'stage', tagFormat: false },
    { name: 'main' }
  ],
  repositoryUrl: 'https://github.com/applyft-web/utils.git',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]'
      }
    ]
  ]
}
