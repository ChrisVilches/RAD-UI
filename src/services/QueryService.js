import BaseService from './BaseService';

class QueryService {
  static create(viewId, name, desc){
    return BaseService.post(`/view/${viewId}/queries`, {
      name: name,
      description: desc
    });
  }

  static show(queryId){
    return BaseService.get(`/query/${queryId}`);
  }

  static update(queryObject, queryId){
    return BaseService.put(`/query/${queryId}`, queryObject);
  }

  static execute(queryId, inputData){
    return BaseService.post(`/query/${queryId}/execute`, inputData);
  }

  static delete(queryId){
    return BaseService.delete(`/query/${queryId}`);
  }

  static queryUseables(queryId, searchOptions){
    return BaseService.get(`/query/${queryId}/connections`, searchOptions);
  }

  static addToConnection(queryId, connectionId){
    return BaseService.post(`/query/${queryId}/add_connection`, { connectionId: connectionId });
  }

  static deleteFromConnection(queryId, connectionId){
    return BaseService.delete(`/query/${queryId}/remove_connection`, { connectionId: connectionId });
  }
}

export default QueryService;
