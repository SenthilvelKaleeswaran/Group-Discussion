

import { Outlet } from "react-router-dom";
import { ConversationProvider } from "../context/conversation";
import { DiscussionProvider } from "../context/details";


const DiscussionWrapper = () => {
  return (
      <ConversationProvider>
        <DiscussionProvider>
          <Outlet />
        </DiscussionProvider>
      </ConversationProvider>
  );
};

export default DiscussionWrapper;
