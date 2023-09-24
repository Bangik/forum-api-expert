const DeleteComment = require('../DeleteComment');

describe('a DeleteComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const commentId = 'comment-123';

    // Action and Assert
    expect(() => new DeleteComment(commentId)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const commentId = 123;
    const threadId = 'thread-123';

    // Action and Assert
    expect(() => new DeleteComment(threadId, commentId)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create deleteComment object correctly', () => {
    // Arrange
    const id = 'comment-123';
    const threadId = 'thread-123';

    // Action
    const { commentId } = new DeleteComment(threadId, id);

    // Assert
    expect(commentId).toEqual(commentId);
  });
});
