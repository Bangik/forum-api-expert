const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const LikeRepository = require('../../../../Domains/likes/LikeRepository');
const AddLikeUseCase = require('../AddLikeUseCase');

describe('AddLikeUseCase', () => {
  it('should orchestrating the add like action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const credentialId = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLike = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const addLikeUseCase = new AddLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await addLikeUseCase.execute(threadId, commentId, credentialId);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread)
      .toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyAvailableCommentInThread)
      .toBeCalledWith(commentId, threadId);
    expect(mockLikeRepository.verifyLike)
      .toBeCalledWith(credentialId, commentId);
    expect(mockLikeRepository.addLike)
      .toBeCalledWith(credentialId, commentId);
  });

  it('should orchestrating the update like action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const credentialId = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLike = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.updateLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const addLikeUseCase = new AddLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await addLikeUseCase.execute(threadId, commentId, credentialId);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread)
      .toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyAvailableCommentInThread)
      .toBeCalledWith(commentId, threadId);
    expect(mockLikeRepository.verifyLike)
      .toBeCalledWith(credentialId, commentId);
    expect(mockLikeRepository.updateLike)
      .toBeCalledWith(credentialId, commentId);
  });
});
