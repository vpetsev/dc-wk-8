'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    category: DataTypes.STRING
  }, {});
  Post.associate = function(models) {
    Post.hasMany(models.Comment, { as: 'comments', foreignKey: 'post_id' });
  };
  return Post;
};
