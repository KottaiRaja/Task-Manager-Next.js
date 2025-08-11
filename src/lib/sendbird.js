// src/lib/sendbird.js
import SendBird from 'sendbird';

const APP_ID = '91187569-5F90-42DE-82E0-837F8FB2FE55'; // Get this from dashboard.sendbird.com
const sb = new SendBird({ appId: APP_ID });

export const connectUser = (userId, nickname) => {
  return new Promise((resolve, reject) => {
    sb.connect(userId, (user, error) => {
      if (error) return reject(error);

      sb.updateCurrentUserInfo(nickname, null, (response, err) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  });
};

export const createOrJoinChannel = (userIds) => {
  return new Promise((resolve, reject) => {
    sb.GroupChannel.createChannelWithUserIds(userIds, true, (channel, error) => {
      if (error) return reject(error);
      resolve(channel);
    });
  });
};

export const sendMessage = (channel, messageText) => {
  return new Promise((resolve, reject) => {
    channel.sendUserMessage(messageText, (message, error) => {
      if (error) return reject(error);
      resolve(message);
    });
  });
};

export { sb };
