const GetThreadUseCase = require('../GetThreadUseCase');
const Threads = require('../../../../Domains/threads/entities/Threads');
const Comments = require('../../../../Domains/comments/entities/Comments');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const Replies = require('../../../../Domains/replies/entities/Replies');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = 'thread-123';

    const threads = new Threads({
      id: useCasePayload,
      title: 'dicoding',
      body: 'secret',
      date: new Date(),
      username: 'dicoding',
    });

    const comments = [
      new Comments({
        id: 'comment-123',
        username: 'dicoding',
        date: new Date(),
        content: 'dicoding',
        is_deleted: false,
        likecount: '2',
      }),
      new Comments({
        id: 'comment-124',
        username: 'dicoding2',
        date: new Date(),
        content: 'dicoding2',
        is_deleted: false,
        likecount: '1',
      }),
      new Comments({
        id: 'comment-125',
        username: 'dicoding3',
        date: new Date(),
        content: 'dicoding3',
        is_deleted: true,
        likecount: '0',
      }),
    ];

    const replies = [
      {
        id: 'reply-123',
        username: 'dicoding',
        date: new Date(),
        content: 'dicoding reply',
        comment_id: 'comment-123',
        is_deleted: false,
      },
      {
        id: 'reply-124',
        username: 'dicoding2',
        date: new Date(),
        content: 'dicoding2 reply',
        comment_id: 'comment-123',
        is_deleted: false,
      },
      {
        id: 'reply-125',
        username: 'dicoding3',
        date: new Date(),
        content: 'dicoding3 reply',
        comment_id: 'comment-124',
        is_deleted: true,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // Mocking
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(threads));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(comments));
    mockReplyRepository.getReplyByCommentId = jest.fn(() => Promise.resolve(replies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const expectedGetThread = {
      ...threads,
      comments: comments.map((comment) => {
        const getReplies = replies.filter((reply) => reply.comment_id === comment.id);
        return {
          ...comment,
          replies: getReplies.map((reply) => new Replies(reply)),
        };
      }),
    };

    // Action
    const getThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(getThread).toStrictEqual(expectedGetThread);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload);
    expect(mockReplyRepository.getReplyByCommentId)
      .toBeCalledWith(comments.map((comment) => comment.id));
  });
});
