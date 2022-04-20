// MongoDB configs

const isDev = process.env.NODE_ENV === "development";

const db_url = isDev ? process.env.dev_atlas_url : process.env.prod_atlas_url;

const Configuration = {
  Port: process.env.PORT || 3000,
  db_url: db_url,
  db_config: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

module.exports = Configuration;
