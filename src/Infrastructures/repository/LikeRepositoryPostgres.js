const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(owner, commentId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, owner],
    };

    const result = await this._pool.query(query);

    return result.rows[0].id;
  }

  async verifyLike(owner, commentId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE owner = $1 AND comment_id = $2',
      values: [owner, commentId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      return false;
    }

    return true;
  }

  async updateLike(owner, commentId) {
    const query = {
      text: `UPDATE comment_likes
      SET is_deleted = (CASE WHEN is_deleted = true THEN false ELSE true END)
      WHERE owner = $1 AND comment_id = $2 RETURNING id`,
      values: [owner, commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = LikeRepositoryPostgres;
