/* istanbul ignore file */
/* eslint-disable camelcase */
const pool = require('../src/Infrastructures/database/postgres/pool');
const AddedReply = require('../src/Domains/replies/entities/AddedReply');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'reply',
    owner = 'user-123',
    commentId = 'comment-123',
    is_deleted = false,
  }) {
    const query = {
      text: 'INSERT INTO replies (id, comment_id, content, owner, is_deleted) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, commentId, content, owner, is_deleted],
    };

    const result = await pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  },
  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
  async deleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },
  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
