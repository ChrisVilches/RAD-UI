import BaseService from './BaseService';

class CompanyService {
  static list(){
    return BaseService.fetchOutsideCompanyScope('/companies');
  }

  static currentCompany(){
    return BaseService.get('');
  }
}

export default CompanyService;
