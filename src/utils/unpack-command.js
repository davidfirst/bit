import fromBase64 from './from-base64';

module.exports = function unpackCmd(str) {
  return JSON.parse(fromBase64(str));
};
