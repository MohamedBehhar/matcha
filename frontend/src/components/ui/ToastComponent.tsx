
import * as Toast from "@radix-ui/react-toast";

export function ToastComponent({ title, description, open, setOpen }:{
  title: string;
  description: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Toast.Provider>
      <Toast.Root
        open={open}
        onOpenChange={setOpen}
        className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex flex-col space-y-2"
      >
        <Toast.Title className="font-bold">{title}</Toast.Title>
        <Toast.Description className="text-sm">{description}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport
        className="fixed top-2 right-4 flex flex-col space-y-2 z-50"
      />
    </Toast.Provider>
  );
}
