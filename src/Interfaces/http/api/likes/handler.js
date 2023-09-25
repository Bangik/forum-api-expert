const AddLikeUseCase = require('../../../../Applications/use_case/likes/AddLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addLikeUseCase = this._container.getInstance(AddLikeUseCase.name);
    await addLikeUseCase.execute(threadId, commentId, credentialId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
