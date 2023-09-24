const AddReply = require('../AddReply');

describe('an AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'abc',
    };
    const commentId = '';

    // Action and Assert
    expect(() => new AddReply(payload, commentId))
      .toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
    };
    const commentId = 'comment-123';

    // Action and Assert
    expect(() => new AddReply(payload, commentId))
      .toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'abc',
    };
    const id = 'comment-123';

    // Action
    const { content, commentId } = new AddReply(payload, id);

    // Assert
    expect(content).toEqual(payload.content);
    expect(commentId).toEqual(id);
  });
});
