import { User } from '@/types';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import BoardMembersList from './BoardMembersList';

interface BoardMembersModalProps {
  open: boolean;
  onClose: () => void;
  members: { userId: string; role: string }[];
  users: User[];
  currentUserRole: string;
  boardId: string;
  onRoleUpdated: () => void;
  onMemberRemoved: () => void;
}

export default function BoardMembersModal({
  open,
  onClose,
  members,
  users,
  currentUserRole,
  boardId,
  onRoleUpdated,
  onMemberRemoved,
}: BoardMembersModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Miembros del tablero</DialogTitle>
        </DialogHeader>
        <BoardMembersList
          members={members}
          users={users}
          currentUserRole={currentUserRole}
          boardId={boardId}
          onRoleUpdated={onRoleUpdated}
          onMemberRemoved={onMemberRemoved}
        />
        <DialogClose asChild>
          <button className="mt-4 w-full rounded bg-gray-200 py-2 font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
            Cerrar
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
