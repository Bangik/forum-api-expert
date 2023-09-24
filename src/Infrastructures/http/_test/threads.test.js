const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LoginTestHelper = require('../../../../tests/LoginTestHelper');

const container = require('../../container');
const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when method POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        body: 'thread body',
      };
      const server = await createServer(container);
      const { accessToken } = await LoginTestHelper.login({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        body: 'thread body',
      };
      const server = await createServer(container);
      const { accessToken } = await LoginTestHelper.login({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: ['thread title'],
        body: 'thread body',
      };
      const server = await createServer(container);
      const { accessToken } = await LoginTestHelper.login({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 401 when request not contain access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread title',
        body: 'thread body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toBeDefined();
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when method GET /threads/{threadId}', () => {
    it('should response 200 and return thread', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId } = await LoginTestHelper.login({ server });
      const { userId: userId2 } = await LoginTestHelper.login({ server, namauser: 'dicoding2' });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        content: 'dicoding comment 123',
        threadId: 'thread-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        owner: userId2,
        content: 'dicoding comment 456',
        threadId: 'thread-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-789',
        owner: userId,
        content: 'dicoding comment 789',
        threadId: 'thread-123',
      });

      await CommentsTableTestHelper.deleteCommentById('comment-789');

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: userId,
        content: 'dicoding reply 123',
        commentId: 'comment-123',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        owner: userId2,
        content: 'dicoding reply 456',
        commentId: 'comment-123',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-789',
        owner: userId,
        content: 'dicoding reply 789',
        commentId: 'comment-123',
      });

      await RepliesTableTestHelper.deleteReplyById('reply-789');

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      const { thread } = responseJson.data;
      const { comments } = thread;

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('dicoding');
      expect(thread.body).toEqual('secret');
      expect(thread.date).toBeDefined();
      expect(thread.username).toEqual('dicoding');
      expect(thread.comments).toHaveLength(3);

      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].date).toBeDefined();
      expect(comments[0].content).toEqual('dicoding comment 123');

      expect(comments[1].id).toEqual('comment-456');
      expect(comments[1].username).toEqual('dicoding2');
      expect(comments[1].date).toBeDefined();
      expect(comments[1].content).toEqual('dicoding comment 456');

      expect(comments[2].id).toEqual('comment-789');
      expect(comments[2].username).toEqual('dicoding');
      expect(comments[2].date).toBeDefined();
      expect(comments[2].content).toEqual('**komentar telah dihapus**');
      expect(comments[2].replies).toHaveLength(0);

      expect(comments[0].replies).toHaveLength(3);
      expect(comments[0].replies[0].id).toEqual('reply-123');
      expect(comments[0].replies[0].username).toEqual('dicoding');
      expect(comments[0].replies[0].date).toBeDefined();
      expect(comments[0].replies[0].content).toEqual('dicoding reply 123');

      expect(comments[0].replies[1].id).toEqual('reply-456');
      expect(comments[0].replies[1].username).toEqual('dicoding2');
      expect(comments[0].replies[1].date).toBeDefined();
      expect(comments[0].replies[1].content).toEqual('dicoding reply 456');

      expect(comments[0].replies[2].id).toEqual('reply-789');
      expect(comments[0].replies[2].username).toEqual('dicoding');
      expect(comments[0].replies[2].date).toBeDefined();
      expect(comments[0].replies[2].content).toEqual('**balasan telah dihapus**');

      expect(comments[1].replies).toHaveLength(0);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak tersedia');
    });
  });
});
