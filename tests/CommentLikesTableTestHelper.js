/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;
