module.exports = {
    webpack: (config) => {
      config.externals = { mysql2: 'commonjs2 mysql2' };
      return config;
    },
  };
  