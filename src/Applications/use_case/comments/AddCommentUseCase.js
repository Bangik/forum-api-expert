const AddComment = require('../../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, ownerId) {
    const addComment = new AddComment(useCasePayload, threadId);
    await this._threadRepository.verifyAvailableThread(threadId);
    return this._commentRepository.addCommentByThreadId(addComment, threadId, ownerId);
  }
}

module.exports = AddCommentUseCase;
