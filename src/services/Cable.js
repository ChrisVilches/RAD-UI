import BaseService from './BaseService';
import actionCable from 'actioncable';
import camelcaseKeys from 'camelcase-keys';

let cable = null;

/*
TODO: There are several problems here.
Having to execute subscribe and unsubscribe for every different view (As of now, its only like this for View, but for other views it'd be also necessary in the future).
*/

class Cable{

  static connect(){
    cable = actionCable.createConsumer(BaseService.socketEndpoint());
  }

  static subscribeToViewEvents(viewId, receivedCallback){
    if(cable === null){
      throw new Error('Execute Cable.connect() first.');
    }
    cable.subscriptions.create({
      channel: 'ViewNotificationChannel',
      id: viewId
    }, {
      connected: () => {
        console.log('Connected to socket');
      },
      disconnected: () => {
        console.log('Disconnected from socket');
        cable = null;
      },
      received: data => {
        data = camelcaseKeys(data, { deep: true });
        receivedCallback(data);
      }
    });
  }

  static unsubscribeFromViewEvents(){
    // TODO: Must implement.
    // Or better, just create a method that clears all subscriptions, not just view-specific,
    // and then just use that one everytime the user changes pages.
    // However, there might be one that never closes, for example some user-scoped notification channel,
    // in which it gets push notifications.
  }
}

export default Cable;
