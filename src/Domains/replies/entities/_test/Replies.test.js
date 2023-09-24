const Replies = require('../Replies');

describe('a Replies entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      comment_id: 'comment-123',
      content: 'dicoding reply',
      date: '2021-08-08T07:59:57.000Z',
      username: 'dicoding',
    };

    // Action and Assert
    expect(() => new Replies(payload)).toThrowError(
      'REPLIES.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      comment_id: true,
      is_deleted: false,
      content: 'dicoding reply',
      date: '2021-08-08T07:59:57.000Z',
      username: 'dicoding',
    };

    // Action and Assert
    expect(() => new Replies(payload)).toThrowError(
      'REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create replies object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      comment_id: 'comment-123',
      is_deleted: false,
      content: 'dicoding reply',
      date: new Date(),
      username: 'dicoding',
    };

    // Action
    const replies = new Replies(payload);

    // Assert
    expect(replies.id).toEqual(payload.id);
    expect(replies.comment_id).toEqual(payload.comment_id);
    expect(replies.content).toEqual(payload.content);
    expect(replies.date).toEqual(payload.date);
    expect(replies.username).toEqual(payload.username);
  });

  it('should create deleted replies object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      comment_id: 'comment-123',
      is_deleted: true,
      content: 'dicoding reply',
      date: new Date(),
      username: 'dicoding',
    };

    // Action
    const replies = new Replies(payload);

    // Assert
    expect(replies.id).toEqual(payload.id);
    expect(replies.comment_id).toEqual(payload.comment_id);
    expect(replies.content).toEqual('**balasan telah dihapus**');
    expect(replies.date).toEqual(payload.date);
    expect(replies.username).toEqual(payload.username);
  });
});
