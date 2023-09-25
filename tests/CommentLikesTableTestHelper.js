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
  async addLike({ id, owner, commentId }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3)',
      values: [id, commentId, owner],
    };

    await pool.query(query);
  },
  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;
