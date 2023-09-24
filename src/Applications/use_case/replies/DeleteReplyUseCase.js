const DeleteReply = require('../../../Domains/replies/entities/DeleteReply');

class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCaseParams, userId) {
    const deleteReply = new DeleteReply(useCaseParams);

    await this._threadRepository.verifyAvailableThread(useCaseParams.threadId);
    await this._commentRepository.verifyAvailableComment(useCaseParams.commentId);
    await this._commentRepository.verifyAvailableCommentInThread(
      useCaseParams.commentId,
      useCaseParams.threadId,
    );
    await this._replyRepository.verifyReply(useCaseParams.replyId);
    await this._replyRepository.verifyReplyOwner(useCaseParams.replyId, userId);

    return this._replyRepository.deleteReply(deleteReply.replyId);
  }
}

module.exports = DeleteReplyUseCase;
