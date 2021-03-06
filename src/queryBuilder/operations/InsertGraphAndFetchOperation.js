import DelegateOperation from './DelegateOperation';
import RelationExpression from '../RelationExpression';
import InsertGraphOperation from './InsertGraphOperation';

export default class InsertGraphAndFetchOperation extends DelegateOperation {

  constructor(name, opt) {
    super(name, opt);

    if (!this.delegate.is(InsertGraphOperation)) {
      throw new Error('Invalid delegate');
    }
  }

  get models() {
    return this.delegate.models;
  }

  get isArray() {
    return this.delegate.isArray;
  }

  onAfterInternal(builder) {
    const eager = RelationExpression.fromGraph(this.models);
    const modelClass = this.models[0].constructor;
    const ids = new Array(this.models.length);

    for (let i = 0, l = this.models.length; i < l; ++i) {
      ids[i] = this.models[i].$id();
    }

    return modelClass
      .query()
      .childQueryOf(builder)
      .whereIn(modelClass.getFullIdColumn(), ids)
      .eager(eager)
      .then(models => {
        return this.isArray ? models : (models[0] || null);
      });
  }
}

