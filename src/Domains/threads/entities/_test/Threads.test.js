const Threads = require('../Threads');

describe('a Threads entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc',
      body: 'abc',
      date: '2021',
      username: 'abc',
    };

    // Action and Assert
    expect(() => new Threads(payload)).toThrowError('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'abc',
      body: 'abc',
      date: '2021',
      username: 'abc',
    };

    // Action and Assert
    expect(() => new Threads(payload)).toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Threads object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'abc',
      body: 'abc',
      date: new Date(),
      username: 'abc',
    };

    // Action
    const {
      id,
      title,
      body,
      date,
      username,
    } = new Threads(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
