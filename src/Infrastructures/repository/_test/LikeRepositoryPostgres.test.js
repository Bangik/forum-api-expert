const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const userId = 'user-123';
  const threadId = 'thread-123';
  const commentId = 'comment-123';

  describe('addLike function', () => {
    it('should persist new like and return added like correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });
      await likeRepositoryPostgres.addLike(userId, commentId);

      // Assert
      const like = await CommentLikesTableTestHelper.findLikeById('like-123');
      expect(like).toHaveLength(1);
    });
  });

  describe('verifyLike function', () => {
    it('should return false if like not exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', owner: userId, commentId });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const isLikeExist = await likeRepositoryPostgres.verifyLike('user-456', commentId);
      expect(isLikeExist).toStrictEqual(false);
    });

    it('should return true if like exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', owner: userId, commentId });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action & Assert
      const isLikeExist = await likeRepositoryPostgres.verifyLike(userId, commentId);
      expect(isLikeExist).toStrictEqual(true);
    });
  });

  describe('updateLike function', () => {
    it('should update like correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', owner: userId, commentId });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.updateLike(userId, commentId);

      // Assert
      const like = await CommentLikesTableTestHelper.findLikeById('like-123');
      expect(like[0].is_deleted).toStrictEqual(true);
      expect(like[0].id).toStrictEqual('like-123');
    });
  });
});
