const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const Threads = require('../../../Domains/threads/entities/Threads');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const user = {
        id: 'user-123',
        username: 'dicoding',
      };
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'secret',
      });
      const ownerId = user.id;
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser(user);
      await threadRepositoryPostgres.addThread(addThread, ownerId);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const user = {
        id: 'user-123',
        username: 'dicoding',
      };
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'secret',
      });
      const ownerId = user.id;
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser(user);
      const addedThread = await threadRepositoryPostgres.addThread(addThread, ownerId);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'dicoding',
        owner: ownerId,
      }));
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when thread not available', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableThread({}))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      // Arrange
      const threadId = 'thread-123';
      const user = {
        id: 'user-123',
        username: 'dicoding',
      };
      const thread = {
        id: 'thread-123',
        title: 'dicoding',
        body: 'secret',
        date: new Date(),
        owner: 'user-123',
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser(user);
      await ThreadsTableTestHelper.addThread(thread);
      await expect(threadRepositoryPostgres.verifyAvailableThread(threadId))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw InvariantError when thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById({ threadId: 'thread-qwe' }))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should not throw InvariantError when thread available', async () => {
      // Arrange
      const user = {
        id: 'user-123',
        username: 'dicoding',
      };
      const thread = {
        id: 'thread-123',
        title: 'dicoding',
        body: 'secret',
        date: new Date(),
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser(user);
      await ThreadsTableTestHelper.addThread(thread);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threads = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(threads).toStrictEqual(new Threads({
        id: threads.id,
        title: threads.title,
        body: threads.body,
        date: threads.date,
        username: user.username,
      }));
    });
  });
});
