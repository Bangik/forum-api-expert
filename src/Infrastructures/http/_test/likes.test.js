const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const LoginTestHelper = require('../../../../tests/LoginTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
    const likesUrl = '/threads/thread-123/comments/comment-123/likes';

    it('should response 200 and persisted add like', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await LoginTestHelper.login({ server });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: likesUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 and persisted update like', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await LoginTestHelper.login({ server });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: likesUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when request params not contain threadId', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await LoginTestHelper.login({ server });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: likesUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak tersedia');
    });

    it('should response 404 when request params not contain commentId', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await LoginTestHelper.login({ server });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: likesUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });

    it('should response 404 when comment not found in thread', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await LoginTestHelper.login({ server });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-456/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Comment tidak ditemukan');
    });

    it('should response 401 when request authentication not contain access token', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: likesUrl,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toBeDefined();
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
