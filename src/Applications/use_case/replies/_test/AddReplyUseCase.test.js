const AddedReply = require('../../../../Domains/replies/entities/AddedReply');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');
const AddReply = require('../../../../Domains/replies/entities/AddReply');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'reply',
    };

    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const userId = 'user-123';

    const expectedAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: userId,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(
      new AddedReply({
        id: 'reply-123',
        content: 'reply',
        owner: 'user-123',
      }),
    ));

    const getReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await getReplyUseCase.execute(
      useCasePayload,
      useCaseParams,
      userId,
    );

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyAvailableThread)
      .toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.verifyAvailableComment)
      .toBeCalledWith(useCaseParams.commentId);
    expect(mockCommentRepository.verifyAvailableCommentInThread)
      .toBeCalledWith(useCaseParams.commentId, useCaseParams.threadId);
    expect(mockReplyRepository.addReply)
      .toBeCalledWith(
        new AddReply(useCasePayload, useCaseParams.commentId),
        userId,
      );
  });
});
