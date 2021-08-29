import BaseService from './BaseService';

class ProjectService {
  static participatingUsers(projectId, searchOptions){
    return BaseService.get(`/project/${projectId}/users`, searchOptions);
  }

  static create(name){
    return BaseService.post(`/projects`, { name });
  }

  static summary(projectId){
    return BaseService.get(`/project/${projectId}/summary`);
  }

  static find(projectId){
    return BaseService.get(`/project/${projectId}`);
  }

  static update(projectId, data){
    return BaseService.put(`/project/${projectId}`, data);
  }

  static delete(projectId){
    return BaseService.delete(`/project/${projectId}`);
  }

  static list(){
    return BaseService.get(`/projects/`);
  }

  static toggleFavorite(projectId, value){
    return BaseService.put(`/project/${projectId}/${value ? '' : 'un'}favorite`);
  }

  static updateUserPermissionsBatch(projectId, userIds, permissionType, bool){
    return BaseService.put(`/project/${projectId}/assign_permission_batch`, {
      userIds,
      permissionType,
      assign: bool
    });
  }
}

export default ProjectService;
