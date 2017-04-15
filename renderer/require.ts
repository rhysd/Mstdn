// In preload script, global.require does not exist.
// So we need to wrap require() to avoid to be bundled.

export default require;
