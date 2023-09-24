const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const thread = {
        id: 'thread-123',
        title: 'dicoding',
        body: 'dicoding',
      };

      const comment = {
        id: 'comment-123',
        content: 'dicoding',
        owner: user.id,
        threadId: thread.id,
      };

      const reply = new AddReply({
        content: 'dicoding',
      }, comment.id);

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser(user);
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment(comment);
      const addedReply = await replyRepositoryPostgres.addReply(reply, user.id);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'dicoding',
        owner: user.id,
      }));

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
    });
  });

  describe('getReplyByCommentId function', () => {
    it('should not throw InvariantError when commentId found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.getReplyByCommentId(['comment-123']))
        .resolves.not.toThrowError(InvariantError);
    });

    it('should return replies correctly', async () => {
      // Arrange
      const user = {
        id: 'user-123',
        username: 'dicoding',
      };

      const thread = {
        id: 'thread-123',
        title: 'dicoding',
        body: 'dicoding',
      };

      const comment = {
        id: 'comment-123',
        content: 'dicoding',
        owner: user.id,
        threadId: thread.id,
      };

      const reply = {
        id: 'reply-123',
        content: 'dicoding',
        owner: user.id,
        commentId: comment.id,
        is_deleted: false,
      };

      const deletedReply = {
        id: 'reply-321',
        content: 'dicoding',
        owner: user.id,
        commentId: comment.id,
        is_deleted: true,
      };

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser(user);
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment(comment);
      await RepliesTableTestHelper.addReply(reply);
      await RepliesTableTestHelper.addReply(deletedReply);
      const replies = await replyRepositoryPostgres.getReplyByCommentId([comment.id]);

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0]).toStrictEqual({
        id: reply.id,
        comment_id: comment.id,
        username: user.username,
        content: reply.content,
        date: expect.any(Date),
        is_deleted: false,
      });
      expect(replies[1]).toStrictEqual({
        id: deletedReply.id,
        comment_id: comment.id,
        username: user.username,
        content: deletedReply.content,
        date: expect.any(Date),
        is_deleted: true,
      });
    });
  });

  describe('verifyReply function', () => {
    it('should return verifyReply correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReply(replyId))
        .resolves.not.toThrowError(InvariantError);
    });

    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReply('reply-123'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should return verifyReplyOwner correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(replyId, userId))
        .resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw AuthorizationError when reply not owned by user', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-321'))
        .rejects.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should soft delete reply correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId });

      // Action
      await replyRepositoryPostgres.deleteReply(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual(replyId);
      expect(replies[0].is_deleted).toEqual(true);
    });
  });
});
