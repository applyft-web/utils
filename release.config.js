module.exports = {
  branches: [
    { name: 'main' }
  ],
  repositoryUrl: 'https://github.com/applyft-web/utils.git',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/npm',
    ['@semantic-release/git', {
      assets: ['package.json', 'CHANGELOG.md'],
      message: `chore(release): ${'${'}nextRelease.version${'}'} [skip ci]`
    }]
  ]
}
