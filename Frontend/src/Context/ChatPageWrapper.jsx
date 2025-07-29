// You can add this right inside your AppRoutes.jsx file
import { useParams } from 'react-router-dom';
import Chat from '@/Pages/Chat';
import UserAuth from "../Authorization/UserAuth";

const ChatPageWrapper = () => {
  const { projectId } = useParams();

  // This key forces a complete remount of the component when the projectId changes.
  return (
    <UserAuth key={projectId}>
      <Chat />
    </UserAuth>
  );
};

export default ChatPageWrapper;