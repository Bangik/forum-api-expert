const GetThread = require('../../../Domains/threads/entities/GetThread');
const Replies = require('../../../Domains/replies/entities/Replies');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const getThread = new GetThread(threadId);
    await this._threadRepository.verifyAvailableThread(threadId);
    const thread = await this._threadRepository.getThreadById(getThread.threadId);
    const getComments = await this._commentRepository.getCommentsByThreadId(getThread.threadId);
    const commentsId = await getComments.map((comment) => comment.id);
    const getReplies = await this._replyRepository.getReplyByCommentId(commentsId);
    const comments = getComments.map((comment) => {
      const getReply = getReplies.filter((reply) => reply.comment_id === comment.id);
      const replies = getReply.map((reply) => new Replies(reply));

      return {
        ...comment,
        replies,
      };
    });

    return {
      ...thread,
      comments,
    };
  }
}

module.exports = GetThreadUseCase;
