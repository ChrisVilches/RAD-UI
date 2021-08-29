import BaseService from './BaseService';

class QueryExecutionService {
  static activity(projectId, searchOptions){
    return BaseService.get(`/project/${projectId}/activity`, searchOptions);
  }

  static results(queryExecutionId){
    return BaseService.get(`/query_execution/${queryExecutionId}/result`);
  }
}

export default QueryExecutionService;
