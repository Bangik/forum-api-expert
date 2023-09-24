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
    const like = await this._likeRepository.verifyLike(commentId, credentialId);
    if (like) {
      await this._likeRepository.updateLike(commentId, credentialId);
    } else {
      await this._likeRepository.addLike(commentId, credentialId);
    }
  }
}

module.exports = AddLikeUseCase;
