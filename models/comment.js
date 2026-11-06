'use strict';
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    post_id: DataTypes.INTEGER
  }, {});
  Comment.associate = function(models) {
    Comment.belongsTo(models.Post, { as: 'post', foreignKey: 'post_id' });
  };
  return Comment;
};
