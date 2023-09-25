/* eslint-disable camelcase */
class Comments {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id,
      username,
      date,
      content,
      is_deleted,
      likecount,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = is_deleted ? '**komentar telah dihapus**' : content;
    this.likeCount = parseInt(likecount, 10);
  }

  _verifyPayload({
    id,
    username,
    date,
    content,
    is_deleted,
    likecount,
  }) {
    if (!id || !username || !date || !content || is_deleted === undefined || !likecount) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof username !== 'string' || !(date instanceof Date) || typeof content !== 'string' || typeof is_deleted !== 'boolean' || typeof likecount !== 'string') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comments;
