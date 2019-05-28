'use strict';

const Dynamo = require('aws-sdk').DynamoDB;

class User {
  constructor(userId) {
    this.dynamo = new Dynamo({
      apiVersion: '2012-08-10',
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.ACCESS_KEY_SECRET,
      region: 'us-east-1'
    });
    this.userId = userId;
  }

  getLocationPref() {
    const params = {
      TableName: `userTable-${process.env.STAGE}`,
      Key: {
        userId: {
          S: this.userId
        }
      }
    };
    return new Promise(resolve => {
      this.dynamo.getItem(params, (err, data) => {
        if (err) {
          console.info('Issue finding location preference:', err);
          resolve();
        } else {
          if (data.Item) {
            resolve(data.Item.location.S);
          } else {
            resolve();
          }
        }
      });
    });
  }

  setLocation(location) {
    let params = {
      TableName: `userTable-${process.env.STAGE}`,
      Item: {
        userId: {
          S: this.userId
        },
        location: {
          S: location
        }
      }
    };
    return new Promise((resolve, reject) => {
      this.dynamo.putItem(params, (err, data) => {
        if (err) {
          reject(err, '\nFailed to set location');
        } else {
          console.log(data);
          console.debug('Set location', location, 'for user', this.userId);
          resolve(location);
        }
      });
    });
  } 
}

exports.User = User;
exports.getLocationPref = User.getLocationPref;
exports.setLocation = User.setLocation;