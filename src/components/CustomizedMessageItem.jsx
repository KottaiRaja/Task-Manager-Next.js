import React, { useMemo } from "react";
import AdminMessage from "./AdminMessage";
import FileMessage from "./FileMessage";
import UserMessage from "./UserMessage";
import "../app/css/poll_message.css";
import PollMessage from "./PollMessage";

export default function CustomizedMessageItem(props) {
  const { userId, currentChannel, updateUserMessage, sb } = props;
  let message = props.message;

  const MessageHOC = useMemo(() => {
    if (message.isAdminMessage && message.isAdminMessage()) {
      return () => <AdminMessage message={message} />;
    } else if (message.isFileMessage && message.isFileMessage()) {
      return () => (
        <FileMessage
          message={message}
          userId={userId}
          currentChannel={currentChannel}
        />
      );
    } else if (message._poll) {
      return () => (
        <PollMessage
          message={message}
          userId={userId}
          currentChannel={currentChannel}
          sb={sb}
        />
      );
    } else if (message.isUserMessage && message.isUserMessage()) {
      return () => (
        <UserMessage
          message={message}
          userId={userId}
          updateUserMessage={updateUserMessage}
          currentChannel={currentChannel}
          sb={sb}
        />
      );
    }
    return () => <div />;
  }, [message, userId, currentChannel, updateUserMessage, sb]);

  return (
    <div id={message.messageId} className="customized-message-item">
      <MessageHOC />
      <br />
    </div>
  );
}
