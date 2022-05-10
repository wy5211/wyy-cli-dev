const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

function getNpmRegistry(original) {
  return original ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

async function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null;
  }

  const registryUrl = registry || getNpmRegistry();
  const url = urlJoin(registryUrl, npmName);
  try {
    const { data = null } = await axios(url);
    // console.log('data', data);
    return data;
  } catch (e) {
    return Promise.reject(e);
  }
}

async function getSemverVsersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  const versions = Object.keys(data?.versions);
  return versions;
}

async function getNpmLastestSemverVersion(npmName, currentVersion, registry) {
  const versions = await getSemverVsersions(npmName, registry);
  const gtVsersions = versions
    .filter((version) => semver.satisfies(version, `^${currentVersion}`))
    .sort((a, b) => {
      return semver.gt(b, a);
    });
  return gtVsersions[0];
}

module.exports = {
  getNpmLastestSemverVersion,
};
