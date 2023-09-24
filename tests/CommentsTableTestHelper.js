/* istanbul ignore file */
/* eslint-disable camelcase */
const pool = require('../src/Infrastructures/database/postgres/pool');
const AddedComment = require('../src/Domains/comments/entities/AddedComment');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'dicoding',
    owner = 'user-123',
    threadId = 'thread-123',
    date = new Date(),
    is_deleted = false,
  }) {
    const query = {
      text: 'INSERT INTO comments (id, thread_id, content, date, owner, is_deleted) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, threadId, content, date, owner, is_deleted],
    };

    const result = await pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  },
  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },
  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },
  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
