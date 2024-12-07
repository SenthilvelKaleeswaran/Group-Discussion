

import { Outlet } from "react-router-dom";
import { MemberProvider } from "../context/member";
import { ConversationProvider } from "../context/conversation";
import { DiscussionProvider } from "../context/details";


const DiscussionWrapper = () => {
  return (
    <MemberProvider>
      <ConversationProvider>
        <DiscussionProvider>
          <Outlet />
        </DiscussionProvider>
      </ConversationProvider>
    </MemberProvider>
  );
};

export default DiscussionWrapper;
