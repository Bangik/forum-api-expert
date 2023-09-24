class DeleteReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { threadId, commentId, replyId } = payload;

    this.threadId = threadId;
    this.commentId = commentId;
    this.replyId = replyId;
  }

  _verifyPayload({ threadId, commentId, replyId }) {
    if (!threadId || !commentId || !replyId) {
      throw new Error('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof threadId !== 'string'
      || typeof commentId !== 'string'
      || typeof replyId !== 'string'
    ) {
      throw new Error('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReply;
