const AddReply = require('../../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, useCaseParams, userId) {
    const addReply = new AddReply(useCasePayload, useCaseParams.commentId);

    await this._threadRepository.verifyAvailableThread(useCaseParams.threadId);
    await this._commentRepository.verifyAvailableComment(useCaseParams.commentId);
    await this._commentRepository.verifyAvailableCommentInThread(
      useCaseParams.commentId,
      useCaseParams.threadId,
    );

    return this._replyRepository.addReply(addReply, userId);
  }
}

module.exports = AddReplyUseCase;
