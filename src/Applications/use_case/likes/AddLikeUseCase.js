class AddLikeUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, credentialId) {
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableComment(commentId);
    await this._commentRepository.verifyAvailableCommentInThread(commentId, threadId);
    const like = await this._likeRepository.verifyLike(credentialId, commentId);
    if (like) {
      await this._likeRepository.updateLike(credentialId, commentId);
    } else {
      await this._likeRepository.addLike(credentialId, commentId);
    }
  }
}

module.exports = AddLikeUseCase;
