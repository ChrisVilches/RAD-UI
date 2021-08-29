import BaseService from './BaseService';

class ConnectionService {
  static list(projectId){
    return BaseService.get(`/project/${projectId}/connections`);
  }

  static addUser(connectionId, userId){
    return BaseService.post(`/connection/${connectionId}/user/${userId}`);
  }

  static deleteUser(connectionId, userId){
    return BaseService.delete(`/connection/${connectionId}/user/${userId}`);
  }

  static upsert(projectId, newConn = {}){
    let connectionId = newConn.connection.id;
    if(typeof connectionId === 'number'){
      // Update
      delete newConn.connection.id;
      return BaseService.put(`/project/${projectId}/connection/${connectionId}`, newConn);
    } else {
      // Insert
      return BaseService.post(`/project/${projectId}/connections`, newConn);
    }
  }

  static delete(connectionId){
    return BaseService.delete(`/connection/${connectionId}`);
  }

  static users(connectionId, searchOptions){
    return BaseService.get(`/connection/${connectionId}/users`, searchOptions);
  }
}

export default ConnectionService;
