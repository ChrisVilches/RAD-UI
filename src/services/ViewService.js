import BaseService from './BaseService';

class ViewService {
  static list(projectId){
    return BaseService.get(`/project/${projectId}/views`);
  }

  static show(viewId, details = false){
    if(details){
      return BaseService.get(`/view/${viewId}/details`);
    }
    return BaseService.get(`/view/${viewId}`);
  }

  static updateView(viewId, data){
    return BaseService.put(`/view/${viewId}`, data);
  }
}

export default ViewService;
